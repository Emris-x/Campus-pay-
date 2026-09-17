import { supabase } from "./supabaseClient";

/**
 * Generates a human-readable receipt number, e.g. CP-240730-8F2K.
 * Students take this (plus the bank confirmation) to their faculty
 * for verification, so it needs to be short enough to write down.
 */
export function generateReceiptNumber() {
  const date = new Date();
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CP-${stamp}-${random}`;
}

/**
 * Creates a transaction record in Supabase for a fee payment.
 * At this stage CampusPay does not move money itself — it is the
 * intermediary that prepares the payment, then the student pays the
 * faculty/school directly (bank transfer, card, or teller).
 */
export async function createTransaction({
  studentId,
  matricNumber,
  registrationNumber,
  feeType,
  facultyName,
  facultyAccountNumber,
  amount,
  campusPayCharge = 500,
}) {
  const receiptNumber = generateReceiptNumber();

  const courseAmount = Number(amount);
  const charge = Number(campusPayCharge);
  const totalAmount = courseAmount + charge;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      student_id: studentId,
      matric_number: matricNumber,
      registration_number: registrationNumber,
      fee_type: feeType,
      faculty_name: facultyName ?? null,
      faculty_account_number: facultyAccountNumber ?? null,
      amount: courseAmount,
      campus_pay_charge: charge,
      total_amount: totalAmount,
      faculty_payable_amount: courseAmount,
      receipt_number: receiptNumber,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
  const receiptNumber = generateReceiptNumber();

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      student_id: studentId,
      matric_number: matricNumber,
      registration_number: registrationNumber,
      fee_type: feeType,
      faculty_name: facultyName ?? null,
      faculty_account_number: facultyAccountNumber ?? null,
      amount,
      receipt_number: receiptNumber,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetches every faculty account on file, used for the account-number dropdown. */
export async function fetchFaculties() {
  const { data, error } = await supabase.from("faculties").select("*").order("name");
  if (error) throw error;
  return data;
}

/** Fetches the signed-in student's transaction history, most recent first. */
export async function fetchTransactions(studentId) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
