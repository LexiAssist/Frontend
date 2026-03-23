import * as nodemailer from 'nodemailer';

// Zoho Mail Pro SMTP Configuration
const SMTP_HOST = 'smtppro.zoho.com';
const SMTP_PORT = 465;
const SMTP_SECURE = true;

// Environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

/**
 * Create and configure the Nodemailer transporter for Zoho SMTP
 */
function createTransport() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

// Singleton transporter instance
const transporter = createTransport();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: Error;
  mocked?: boolean;
}

/**
 * Send an email using Zoho SMTP via Nodemailer
 * @param options - Email configuration options
 * @returns Promise<EmailResult> - Result of the email send operation
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // If transporter is not configured, return mock success
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping email send.');
    return { success: true, mocked: true };
  }

  try {
    const fromAddress = options.from || EMAIL_USER;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export interface WaitlistEmailData {
  name: string;
  email: string;
}

/**
 * Send waitlist confirmation email
 * @param data - Waitlist entry data
 * @returns Promise<EmailResult> - Result of the email send operation
 */
export async function sendWaitlistConfirmation({ name, email }: WaitlistEmailData): Promise<EmailResult> {
  const subject = 'Welcome to the LexiAssist Waitlist! 🎉';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #377749;">Welcome to the LexiAssist Waitlist!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining our waitlist! We're excited to have you on board.</p>
      <p>You'll be among the first to know when we launch, with:</p>
      <ul>
        <li>✅ Early access to the platform</li>
        <li>✅ Exclusive launch offers</li>
        <li>✅ Special benefits for early adopters</li>
      </ul>
      <p>We'll keep you updated on our progress and notify you as soon as we're ready for you.</p>
      <p>Best regards,<br>The LexiAssist Team</p>
    </div>
  `;

  const text = `
Welcome to the LexiAssist Waitlist!

Hi ${name},

Thank you for joining our waitlist! We're excited to have you on board.

You'll be among the first to know when we launch, with:
- Early access to the platform
- Exclusive launch offers
- Special benefits for early adopters

We'll keep you updated on our progress and notify you as soon as we're ready for you.

Best regards,
The LexiAssist Team
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
