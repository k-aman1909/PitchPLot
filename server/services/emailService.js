import nodemailer from 'nodemailer';

/**
 * Creates Nodemailer Transporter instance
 */
const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const service = process.env.EMAIL_SERVICE;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null; // Local Dev Mode (No SMTP Configured)
  }

  // Direct Custom SMTP (Host & Port)
  if (host) {
    return nodemailer.createTransport({
      host: host.trim(),
      port: port,
      secure: secure,
      auth: {
        user: user.trim(),
        pass: pass.replace(/\s+/g, '')
      }
    });
  }

  // Service Shortcut (e.g. Gmail)
  return nodemailer.createTransport({
    service: service || 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, '')
    }
  });
};

/**
 * Sends a 6-digit OTP verification email to user's address
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, isDevMock?: boolean}>}
 */
export const sendOTPEmail = async (email, otp) => {
  const transporter = getTransporter();

  // HTML Email Template for SlideSense OTP Verification
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background-color: #0F172A; color: #F8FAFC; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0; tracking-tight: -0.025em;">
          SlideSense <span style="color: #6D4AFF;">AI</span>
        </h1>
        <p style="color: #94A3B8; font-size: 13px; margin-top: 4px;">AI Presentation Coach & Speech Intelligence</p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 24px; text-align: center;">
        <h2 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin-top: 0;">Email Address Verification</h2>
        <p style="color: #CBD5E1; font-size: 13px; line-height: 1.5;">
          Please use the following 6-digit One-Time Password (OTP) to complete your SlideSense account signup.
        </p>

        <div style="margin: 28px 0; background: linear-gradient(135deg, rgba(109, 74, 255, 0.2), rgba(99, 102, 241, 0.2)); border: 2px dashed #6D4AFF; border-radius: 14px; padding: 16px; display: inline-block;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #A78BFA; display: block; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);">
            ${otp}
          </span>
        </div>

        <p style="color: #64748B; font-size: 12px; margin-bottom: 0;">
          ⏱️ This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">
        If you did not request this verification email, please ignore this message.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('\n==================================================');
    console.log(`📧 [SLIDESENSE DEV OTP EMAIL]`);
    console.log(`TO: ${email}`);
    console.log(`OTP CODE: >>> ${otp} <<<`);
    console.log(`EXPIRES: 10 Minutes`);
    console.log('==================================================\n');

    return { success: true, isDevMock: true, devOtp: otp };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SlideSense AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `[${otp}] Your SlideSense Email Verification Code`,
      html: htmlContent
    });

    console.log(`[Email Service] OTP Email dispatched to ${email}. MessageId: ${info.messageId}`);
    return { success: true, isDevMock: false };
  } catch (error) {
    console.error('[Email Service] Transporter Error:', error.message);
    // Return mock success with console fallback so signup is never blocked
    console.log(`\n📧 [FALLBACK DEV OTP LOG] TO: ${email} | OTP: ${otp}\n`);
    return { success: true, isDevMock: true, devOtp: otp, error: error.message };
  }
};

/**
 * Sends an HTML Payment Confirmation & Subscription Receipt Email
 */
export const sendPaymentConfirmationEmail = async ({
  email,
  name,
  orderId,
  paymentId,
  amount = '₹299',
  planName = 'SlideSense Pro Plan',
  date = new Date().toLocaleDateString()
}) => {
  const transporter = getTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background-color: #0F172A; color: #F8FAFC; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0;">
          SlideSense <span style="color: #6D4AFF;">Pro</span> 🎉
        </h1>
        <p style="color: #94A3B8; font-size: 13px; margin-top: 4px;">Payment Receipt & Subscription Active</p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 24px;">
        <h2 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin-top: 0;">Thank you for upgrading, ${name || 'Presenter'}!</h2>
        <p style="color: #CBD5E1; font-size: 13px; line-height: 1.5;">
          Your payment has been successfully processed and verified. Your <strong>${planName}</strong> subscription is now active.
        </p>

        <div style="margin: 20px 0; padding: 16px; background: #070B14; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #CBD5E1;">
            <tr>
              <td style="padding: 6px 0; color: #94A3B8;">Plan Activated</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #A78BFA;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94A3B8;">Amount Paid</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #34D399;">${amount} / month</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94A3B8;">Razorpay Payment ID</td>
              <td style="padding: 6px 0; text-align: right; font-mono: monospace; font-size: 12px;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94A3B8;">Order Reference</td>
              <td style="padding: 6px 0; text-align: right; font-mono: monospace; font-size: 12px;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94A3B8;">Date</td>
              <td style="padding: 6px 0; text-align: right;">${date}</td>
            </tr>
          </table>
        </div>

        <div style="background: rgba(109, 74, 255, 0.1); border: 1px solid rgba(109, 74, 255, 0.3); border-radius: 12px; padding: 14px; text-align: center; margin-top: 16px;">
          <span style="color: #A78BFA; font-size: 13px; font-weight: 700; display: block;">
            ✨ Unlimited AI Presentations & Comprehensive Reports Unlocked
          </span>
        </div>
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">
        SlideSense AI • AI Presentation Coach & Viva Intelligence Platform
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('\n==================================================');
    console.log(`💳 [SLIDESENSE DEV PAYMENT CONFIRMATION EMAIL]`);
    console.log(`TO: ${email}`);
    console.log(`PLAN: ${planName} (${amount})`);
    console.log(`PAYMENT ID: ${paymentId}`);
    console.log(`ORDER ID: ${orderId}`);
    console.log('==================================================\n');
    return { success: true, isDevMock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SlideSense AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Payment Confirmed - SlideSense Pro Activated (${amount})`,
      html: htmlContent
    });

    console.log(`[Email Service] Payment Confirmation Email dispatched to ${email}. MessageId: ${info.messageId}`);
    return { success: true, isDevMock: false };
  } catch (error) {
    console.error('[Email Service] Transporter Error on Payment Email:', error.message);
    console.log(`\n💳 [FALLBACK PAYMENT LOG] TO: ${email} | PaymentID: ${paymentId} | Plan: ${planName}\n`);
    return { success: true, isDevMock: true, error: error.message };
  }
};
