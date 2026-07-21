import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

// Create Nodemailer SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports (587)
    auth: {
      user: process.env.SMTP_USER || 'yatneshpuranik@gmail.com',
      pass: process.env.SMTP_PASS || 'jtrsbclgttjbnzvh',
    },
  });
};

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || '"NextGen ERP" <yatneshpuranik@gmail.com>';

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    logger.info(`Email sent successfully to ${to} for subject: "${subject}"`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to send email to ${to}: ${error.message}`, { stack: error.stack });
    return false;
  }
};

export const sendWelcomeEmail = async (toEmail: string, name: string): Promise<boolean> => {
  const subject = 'Welcome to NextGen ERP + CRM Platform';
  const text = `Hello ${name},\n\nYour account has been registered successfully on our platform.\n\nBest regards,\nNextGen Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Welcome to NextGen ERP + CRM</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been successfully created by the administrator on our platform.</p>
      <p>You can now log in using your registered email: <code>${toEmail}</code>.</p>
      <hr style="border: 0; border-top: 1px solid #eef2f6; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated system email. Please do not reply directly.</p>
    </div>
  `;

  return sendMail(toEmail, subject, text, html);
};

export const sendPasswordChangeNotification = async (toEmail: string, name: string): Promise<boolean> => {
  const subject = 'Security Alert: Password Changed';
  const text = `Hello ${name},\n\nThis is a confirmation that your account password was changed successfully.\n\nIf you did not perform this change, please contact administration immediately.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
      <h2 style="color: #e11d48; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Security Alert: Password Changed</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>This is a confirmation that the password for your account <code>${toEmail}</code> was recently changed.</p>
      <p style="color: #ef4444; font-weight: bold;">If you did not authorize this change, please contact IT administration immediately to lock your account.</p>
      <hr style="border: 0; border-top: 1px solid #eef2f6; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated security email. Please do not reply directly.</p>
    </div>
  `;

  return sendMail(toEmail, subject, text, html);
};
