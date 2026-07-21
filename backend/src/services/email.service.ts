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

import { prisma } from '../config/db';

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: any[]
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || '"NextGen ERP" <yatneshpuranik@gmail.com>';

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments
    });

    logger.info(`Email sent successfully to ${to} for subject: "${subject}"`);

    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        status: 'SENT',
        sentTime: new Date()
      }
    }).catch(() => {});

    return true;
  } catch (error: any) {
    logger.error(`Failed to send email to ${to}: ${error.message}`, { stack: error.stack });

    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        status: 'FAILED',
        failureReason: error.message,
        sentTime: new Date()
      }
    }).catch(() => {});

    return false;
  }
};

export const sendWelcomeEmail = async (
  toEmail: string,
  name: string,
  role?: string,
  password?: string
): Promise<boolean> => {
  const subject = 'Welcome to NextGen ERP + CRM Platform — Account Credentials';
  const text = `Hello ${name},\n\nYour account has been registered successfully on NextGen ERP + CRM.\n\nLogin Credentials:\n- Name: ${name}\n- Email: ${toEmail}\n- Role: ${role || 'SALES'}\n- Password: ${password || '********'}\n\nPlease log in at http://localhost:5173/login and update your password.\n\nBest regards,\nNextGen Admin Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #085041; border-bottom: 2px solid #eef2f6; padding-bottom: 12px; margin-top: 0;">🎉 Welcome to NextGen ERP + CRM</h2>
      <p style="font-size: 15px; color: #1e293b;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #334155;">Your user profile has been successfully constructed by the system administrator on the <strong>NextGen ERP + CRM Platform</strong>.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0f6e56; padding: 18px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f6e56; font-size: 14px;">🔑 Account Credentials</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 120px;">Full Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Email Address:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">${toEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Assigned Role:</td>
            <td style="padding: 6px 0;">
              <span style="background-color: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase;">${role || 'SALES'}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Security Password:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">${password || '********'}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 13px; color: #475569;">You can log in to your account at: <a href="http://localhost:5173/login" style="color: #0f6e56; font-weight: bold; text-decoration: underline;">http://localhost:5173/login</a></p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is an automated system email from NextGen ERP Account Provisioner. Please do not reply directly.</p>
    </div>
  `;

  return sendMail(toEmail, subject, text, html);
};

export const sendPasswordChangeNotification = async (toEmail: string, name: string): Promise<boolean> => {
  const subject = 'Security Alert: Password Changed';
  const text = `Hello ${name},\n\nThis is a confirmation that your account password was changed successfully.\n\nIf you did not perform this change, please contact administration immediately.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #a32d2d; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Security Alert: Password Changed</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>This is a confirmation that the password for your account <code>${toEmail}</code> was recently changed.</p>
      <p style="color: #ef4444; font-weight: bold;">If you did not authorize this change, please contact IT administration immediately to lock your account.</p>
      <hr style="border: 0; border-top: 1px solid #eef2f6; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated security email. Please do not reply directly.</p>
    </div>
  `;

  return sendMail(toEmail, subject, text, html);
};

export const sendChallanEmail = async (
  toEmail: string,
  customerName: string,
  challanNumber: string,
  totalAmount: number,
  pdfBuffer?: Buffer
): Promise<boolean> => {
  const subject = `Sales Order Dispatch Confirmation: ${challanNumber}`;
  const text = `Hello ${customerName},\n\nThis is a confirmation that your sales delivery order ${challanNumber} has been verified and processed.\n\nTotal Billing Amount: ₹${totalAmount.toFixed(2)}\n\nBest regards,\nNextGen Accounts Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #085041; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Sales Delivery Dispatch Confirmed</h2>
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>We are pleased to inform you that your sales order <strong>${challanNumber}</strong> has been successfully confirmed and processed for dispatch.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #0f6e56;">
        <p style="margin: 0; font-size: 14px;"><strong>Order ID:</strong> ${challanNumber}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Gross Valuation:</strong> ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </div>
      <p>The PDF dispatch challan document has been compiled and attached for your records.</p>
      <hr style="border: 0; border-top: 1px solid #eef2f6; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">NextGen ERP Dispatch Office. Please contact helpdesk@nextgenerp.com for discrepancies.</p>
    </div>
  `;

  const attachments = pdfBuffer ? [{
    filename: `${challanNumber}.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf'
  }] : undefined;

  return sendMail(toEmail, subject, text, html, attachments);
};

export const sendLowInventoryAlert = async (
  toEmail: string,
  productName: string,
  sku: string,
  availableStock: number,
  minimumStock: number
): Promise<boolean> => {
  const subject = `⚠️ CRITICAL: Low Stock Warning Alert [SKU: ${sku}]`;
  const text = `Low stock alert for ${productName} (${sku}). Current stock: ${availableStock}, Minimum required: ${minimumStock}. Please place reorder immediately.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 8px;">
      <h2 style="color: #b91c1c; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">⚠️ Low Stock Alarm Notification</h2>
      <p>Attention Operations Team,</p>
      <p>This is an automated safety warning indicating that a catalog product stock has breached its configured minimum reorder limit.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
        <tr style="background-color: #fef2f2;">
          <td style="padding: 8px; border: 1px solid #fee2e2; font-weight: bold;">Product Name:</td>
          <td style="padding: 8px; border: 1px solid #fee2e2;">${productName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #fee2e2; font-weight: bold;">SKU Code:</td>
          <td style="padding: 8px; border: 1px solid #fee2e2; font-family: monospace;">${sku}</td>
        </tr>
        <tr style="background-color: #fef2f2;">
          <td style="padding: 8px; border: 1px solid #fee2e2; font-weight: bold;">Current Available:</td>
          <td style="padding: 8px; border: 1px solid #fee2e2; color: #b91c1c; font-weight: bold;">${availableStock} units</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #fee2e2; font-weight: bold;">Safety Minimum:</td>
          <td style="padding: 8px; border: 1px solid #fee2e2;">${minimumStock} units</td>
        </tr>
      </table>
      <p style="color: #b91c1c; font-weight: bold;">Please coordinate with procurement to initiate stock replacement immediately.</p>
      <hr style="border: 0; border-top: 1px solid #fee2e2; margin: 20px 0;" />
      <p style="font-size: 11px; color: #7f1d1d;">NextGen ERP Automated Inventory Watchdog.</p>
    </div>
  `;

  return sendMail(toEmail, subject, text, html);
};
