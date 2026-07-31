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
  feeType, // 'school_fee' | 'admission_fee' | 'course_registration'
  facultyName,
  facultyAccountNumber,
  amount,
}) {
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

  // ------------------------------------------------------------------
  // BANK / PAYMENT-GATEWAY INTEGRATION — placeholder
  // ------------------------------------------------------------------
  // Once bank API credentials are available, call out to them here to:
  //   1. Verify facultyAccountNumber against the bank's records
  //      (surface a "did you mean...?" suggestion if it's close but not
  //      an exact match — this is what powers the faculty dropdown).
  //   2. Kick off the actual transfer/card charge, or return a payment
  //      link for mobile transfer / card checkout.
  //   3. Update the transaction's `payment_reference` and `status`
  //      once the bank confirms the transfer.
  //
  // const bankResult = await initiateBankPayment({
  //   accountNumber: facultyAccountNumber,
  //   amount,
  //   reference: receiptNumber,
  // });
  // await supabase.from("transactions")
  //   .update({ payment_reference: bankResult.reference, status: "paid" })
  //   .eq("id", data.id);
  // ------------------------------------------------------------------

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
