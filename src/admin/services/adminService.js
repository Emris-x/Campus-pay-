import { supabase } from "../../lib/supabaseClient";

const ADMIN_ROLES = ["super_admin", "admin", "finance_admin", "support_admin"];

function normalizeError(error, fallback) {
  if (!error) return fallback;
  if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
    return fallback;
  }
  return error.message || fallback;
}

function isTableMissingError(error) {
  return error?.code === "42P01" || error?.message?.includes("does not exist") || error?.message?.includes("relation");
}

async function getAuthenticatedUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user?.id) throw new Error("You must be signed in to perform this action.");

  return user.id;
}

export async function fetchAdminProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase.from("admin_profiles").select("*").eq("id", userId).maybeSingle();

  if (error && !isTableMissingError(error)) {
    throw error;
  }

  return data;
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export async function fetchAdminOverview() {
  const [studentsResult, transactionsResult, recentResult] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("transactions").select("id, amount, status", { count: "exact" }),
    supabase
      .from("transactions")
      .select(
        "id, amount, status, created_at, fee_type, receipt_number, matric_number, faculty_name, student_id, students(full_name)"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (transactionsResult.error) throw transactionsResult.error;
  if (recentResult.error) throw recentResult.error;

  const totalVolume = (transactionsResult.data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pendingCount = (transactionsResult.data ?? []).filter((row) => row.status === "pending").length;
  const verifiedCount = (transactionsResult.data ?? []).filter((row) => row.status === "verified").length;
  const failedCount = (transactionsResult.data ?? []).filter((row) => row.status === "failed").length;

  return {
    studentCount: studentsResult.count ?? 0,
    transactionCount: transactionsResult.count ?? 0,
    totalVolume,
    pendingCount,
    verifiedCount,
    failedCount,
    recentTransactions: recentResult.data ?? [],
  };
}

export async function fetchUsers({ search = "", page = 1, pageSize = 8 }) {
  let query = supabase
    .from("students")
    .select("id, full_name, email, matric_number, registration_number, faculty, created_at", { count: "exact" });

  if (search.trim()) {
    const term = search.trim();
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,matric_number.ilike.%${term}%,registration_number.ilike.%${term}%,faculty.ilike.%${term}%`
    );
  }

  const fromIndex = (page - 1) * pageSize;
  const toIndex = fromIndex + pageSize - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(fromIndex, toIndex);

  if (error) throw error;

  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchTransactions({ search = "", status = "all", feeType = "all", faculty = "all", page = 1, pageSize = 10 }) {
  let query = supabase
    .from("transactions")
    .select(
      "id, amount, status, created_at, fee_type, receipt_number, matric_number, registration_number, faculty_name, faculty_account_number, payment_reference, verified_at, student_id, students(full_name, email)",
      { count: "exact" }
    );

  if (search.trim()) {
    const term = search.trim();
    query = query.or(
      `matric_number.ilike.%${term}%,receipt_number.ilike.%${term}%,faculty_name.ilike.%${term}%,registration_number.ilike.%${term}%`
    );
  }

  if (status !== "all") query = query.eq("status", status);
  if (feeType !== "all") query = query.eq("fee_type", feeType);
  if (faculty !== "all") query = query.eq("faculty_name", faculty);

  const fromIndex = (page - 1) * pageSize;
  const toIndex = fromIndex + pageSize - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(fromIndex, toIndex);

  if (error) throw error;

  return { data: data ?? [], count: count ?? 0 };
}

export async function verifyTransaction(transactionId) {
  const actorId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("transactions")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("id", transactionId)
    .select()
    .single();

  if (error) throw error;

  await recordAuditEvent({
    actorId,
    action: "verified_transaction",
    entityType: "transaction",
    entityId: transactionId,
    details: { status: "verified" },
  });

  return data;
}

export async function fetchPaymentsSummary() {
  const { data, error } = await supabase.from("transactions").select("id, amount, fee_type, status");

  if (error) throw error;

  const rows = data ?? [];
  const byType = rows.reduce((acc, row) => {
    const key = row.fee_type || "unknown";
    acc[key] = acc[key] || { total: 0, count: 0, pending: 0, verified: 0 };
    acc[key].total += Number(row.amount || 0);
    acc[key].count += 1;
    if (row.status === "pending") acc[key].pending += 1;
    if (row.status === "verified") acc[key].verified += 1;
    return acc;
  }, {});

  return {
    rows,
    byType,
    totalVolume: rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
  };
}

export async function fetchWalletSummary() {
  const { data, error } = await supabase.from("wallet_ledgers").select("id, amount, entry_type, created_at").order("created_at", { ascending: false }).limit(8);
  if (error) {
    if (isTableMissingError(error)) {
      return { unavailable: true, message: "Wallet ledger data is not available until the admin migration is applied." };
    }
    throw error;
  }

  return { unavailable: false, rows: data ?? [] };
}

export async function fetchAnalytics() {
  const { data, error } = await supabase.from("transactions").select("id, amount, status, created_at, fee_type, faculty_name");
  if (error) throw error;

  const rows = data ?? [];
  const statusDistribution = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const feeDistribution = rows.reduce((acc, row) => {
    acc[row.fee_type] = (acc[row.fee_type] || 0) + 1;
    return acc;
  }, {});

  const volumeByMonth = rows.reduce((acc, row) => {
    const month = new Date(row.created_at).toLocaleString("en-US", { month: "short" });
    acc[month] = (acc[month] || 0) + Number(row.amount || 0);
    return acc;
  }, {});

  return { rows, statusDistribution, feeDistribution, volumeByMonth };
}

export async function fetchNotifications() {
  const { data, error } = await supabase.from("notifications").select("id, title, body, type, status, created_at").order("created_at", { ascending: false }).limit(10);
  if (error) {
    if (isTableMissingError(error)) {
      return { unavailable: true, message: "Notifications are wired into the schema migration, but the current database has not applied it yet." };
    }
    throw error;
  }

  return { unavailable: false, rows: data ?? [] };
}

export async function fetchAdmins() {
  const { data, error } = await supabase.from("admin_profiles").select("id, role, status, created_at, last_seen_at").order("created_at", { ascending: false });
  if (error) {
    if (isTableMissingError(error)) {
      return { unavailable: true, message: "Admin profiles are not available until the migration is applied." };
    }
    throw error;
  }

  return { unavailable: false, rows: data ?? [] };
}

export async function fetchAuditLogs() {
  const { data, error } = await supabase.from("audit_logs").select("id, action, entity_type, entity_id, details, created_at").order("created_at", { ascending: false }).limit(20);
  if (error) {
    if (isTableMissingError(error)) {
      return { unavailable: true, message: "Audit trails will appear here once the admin migration is applied to Supabase." };
    }
    throw error;
  }

  return { unavailable: false, rows: data ?? [] };
}

export async function fetchSettings() {
  const { data, error } = await supabase.from("system_settings").select("id, key, value, updated_at").order("key", { ascending: true });
  if (error) {
    if (isTableMissingError(error)) {
      return { unavailable: true, message: "System settings are ready in the migration plan and will become available after the database is updated." };
    }
    throw error;
  }

  return { unavailable: false, rows: data ?? [] };
}

export async function recordAuditEvent({ action, entityType, entityId, details }) {
  const actorId = await getAuthenticatedUserId();

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });

  if (error) {
    if (isTableMissingError(error)) {
      throw new Error("Audit logs are not available until the Supabase migration is applied.");
    }
    throw error;
  }
}

export { normalizeError };
