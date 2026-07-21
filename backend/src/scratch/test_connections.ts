import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '../config/db';
import nodemailer from 'nodemailer';

async function testDatabase() {
  console.log('Testing Database Connection (Neon)...');
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if we can query the User table
    const count = await prisma.user.count();
    console.log(`ℹ️ Current registered users: ${count}`);
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

async function testEmail() {
  console.log('Testing Email Connection (SMTP)...');
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log(`ℹ️ SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`ℹ️ SMTP User: ${process.env.SMTP_USER}`);

    await transporter.verify();
    console.log('✅ SMTP transporter configuration verified successfully!');
    
    // Send a test email to the user
    console.log('Sending a test email to your inbox...');
    const from = process.env.EMAIL_FROM || `"NextGen ERP" <${process.env.SMTP_USER}>`;
    const to = process.env.SMTP_USER || 'yatneshpuranik@gmail.com';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'NextGen ERP Connection Test Successful',
      text: 'Congratulations! Your database and email transporter connections are working perfectly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Connection Test Passed</h2>
          <p>This email confirms that your Gmail App Password and Nodemailer configurations are correct.</p>
          <p><strong>Status:</strong></p>
          <ul>
            <li>Database Connection: <strong>OK</strong></li>
            <li>SMTP Transporter Verification: <strong>OK</strong></li>
          </ul>
          <p>Ready to move forward to the next phases!</p>
        </div>
      `
    });
    console.log(`✅ Test email sent successfully! MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error('❌ Email connection or send failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

async function main() {
  await testDatabase();
  console.log('\n--------------------------------------------------\n');
  await testEmail();
  await prisma.$disconnect();
}

main().catch(console.error);
