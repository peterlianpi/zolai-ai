/**
 * Unified email sender. Tries Resend first (if RESEND_API_KEY is set),
 * falls back to nodemailer/SMTP.
 */
export { sendEmail } from "./resend";
