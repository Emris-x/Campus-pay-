import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      return;
    }
    supabase
      .from("students")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  // Students sign in with matric number, which we resolve to the email
  // on file so Supabase's email/password auth can be reused as-is.
  async function signInWithMatric(matricNumber, password) {
    const { data: match, error: lookupError } = await supabase
      .from("students")
      .select("email")
      .eq("matric_number", matricNumber)
      .single();

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

  async function signUp({ fullName, email, matricNumber, registrationNumber, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("students").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        matric_number: matricNumber,
        registration_number: registrationNumber,
      });
      if (profileError) throw profileError;
    }
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signInWithMatric, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
