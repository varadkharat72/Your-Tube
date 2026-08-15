import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const sendMail = async ({ from, to, subject, text, html }) => {
  const { data, error } = await resend.emails.send({
    from: from || process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  if (error) {
    console.error("RESEND EMAIL ERROR:", error);
    throw new Error(error.message || "Failed to send email");
  }
  return data;
};

export default sendMail;
