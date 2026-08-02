import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { isAdminRole } from "../admin/services/adminService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setAdminProfile(null);
      setAdminLoading(false);
      return;
    }

    setAdminLoading(true);

    supabase
      .from("students")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error) setProfile(data);
        else setProfile(null);
      });

    supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setAdminProfile(data);
        } else {
          setAdminProfile(null);
        }
        setAdminLoading(false);
      });
  }, [session]);

  const isAdmin = useMemo(() => {
    return Boolean(adminProfile?.status === "active" && isAdminRole(adminProfile?.role));
  }, [adminProfile]);

  async function signInWithMatric(matricNumber, password) {
    const { data: match, error: lookupError } = await supabase
      .from("students")
      .select("email")
      .eq("matric_number", matricNumber)
      .maybeSingle();

    if (lookupError || !match) {
      throw new Error("We couldn't find an account with that matric number.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: match.email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signUp({
    fullName,
    email,
    matricNumber,
    registrationNumber,
    password,
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          matric_number: matricNumber,
          registration_number: registrationNumber,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        adminProfile,
        loading,
        adminLoading,
        isAdmin,
        signInWithMatric,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
