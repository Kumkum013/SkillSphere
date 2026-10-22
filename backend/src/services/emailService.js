const nodemailer = require('nodemailer');

const getEmailConfig = () => ({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
  user: process.env.SMTP_USER || process.env.EMAIL_USER,
  pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  secure: process.env.SMTP_SECURE || process.env.EMAIL_SECURE
});

// Helper to create nodemailer transporter
const getTransporter = () => {
  const config = getEmailConfig();
  if (!config.user || !config.pass) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure === 'true' || (!config.secure && config.port === 465),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
};

const getFromAddress = () => {
  const config = getEmailConfig();
  return process.env.MAIL_FROM || `"SkillSphere" <${config.user}>`;
};

const getSmtpNotConfiguredReason = () => (
  'SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS must be configured to send email'
);

/**
 * 1. Project Owner invites Student to join project
 */
const sendInvitationEmail = async ({ recipient, project, owner, invitationId }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: getSmtpNotConfiguredReason() };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const actionUrl = `${frontendUrl}/invitations`;

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: recipient.email,
      subject: `🎯 You're invited to join "${project.title}" on SkillSphere!`,
      text: `Hello ${recipient.name},\n\n${owner.name} has invited you to collaborate on the project "${project.title}".\n\nVisit ${actionUrl} to accept or decline this invitation.\n\nBest,\nSkillSphere Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #f87171, #fb7185); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">SkillSphere</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">Project Team Invitation</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #e2e8f0; margin-top: 0;">Hi <strong>${recipient.name}</strong>,</p>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
              <strong>${owner.name}</strong> has invited you to join their project team:
            </p>
            <div style="background: #131b2e; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0;">${project.title}</h2>
              <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">${project.description || 'No description provided.'}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${actionUrl}" style="background: #f87171; color: #ffffff; padding: 14px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block;">
                Review Invitation
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">
              If the button doesn't work, open this link: <a href="${actionUrl}" style="color: #f87171;">${actionUrl}</a>
            </p>
          </div>
          <div style="background: #070a12; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #475569; font-size: 12px; margin: 0;">SkillSphere Campus Collaboration Platform</p>
          </div>
        </div>
      `
    });

    console.log(`✅ Invitation email sent to ${recipient.email}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send invitation email to ${recipient.email}:`, err.message);
    return { sent: false, error: err.message };
  }
};

/**
 * 2. Student sends Join Request to Project Owner
 */
const sendJoinRequestEmail = async ({ owner, requester, project }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: getSmtpNotConfiguredReason() };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const actionUrl = `${frontendUrl}/join-requests`;

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: owner.email,
      subject: `📩 New Join Request for "${project.title}" from ${requester.name}`,
      text: `Hello ${owner.name},\n\n${requester.name} has requested to join your project "${project.title}".\n\nVisit ${actionUrl} to review and accept/reject this request.\n\nBest,\nSkillSphere Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">SkillSphere</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">New Team Join Request</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #e2e8f0; margin-top: 0;">Hi <strong>${owner.name}</strong>,</p>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
              <strong>${requester.name}</strong> (${requester.email}) is interested in contributing to your project:
            </p>
            <div style="background: #131b2e; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0;">${project.title}</h2>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Applicant: <strong>${requester.name}</strong></p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${actionUrl}" style="background: #3b82f6; color: #ffffff; padding: 14px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block;">
                Review Application
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">
              Manage all join requests here: <a href="${actionUrl}" style="color: #3b82f6;">${actionUrl}</a>
            </p>
          </div>
          <div style="background: #070a12; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #475569; font-size: 12px; margin: 0;">SkillSphere Campus Collaboration Platform</p>
          </div>
        </div>
      `
    });

    console.log(`✅ Join request email sent to ${owner.email}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send join request email to ${owner.email}:`, err.message);
    return { sent: false, error: err.message };
  }
};

/**
 * 3. Password Reset Email
 */
const sendPasswordResetEmail = async ({ recipient, resetUrl }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: getSmtpNotConfiguredReason() };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: recipient.email,
      subject: '🔐 Password Reset Request for SkillSphere',
      text: `Hello ${recipient.name},\n\nYou requested a password reset for your SkillSphere account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest,\nSkillSphere Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">SkillSphere</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">Password Reset Request</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #e2e8f0; margin-top: 0;">Hi <strong>${recipient.name}</strong>,</p>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
              We received a request to reset your password for your SkillSphere account.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background: #8b5cf6; color: #ffffff; padding: 14px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 24px 0;">
              This link will expire in 1 hour for your security.
            </p>
            <p style="font-size: 13px; color: #64748b; margin: 0;">
              If the button doesn't work, copy and paste this link:<br>
              <a href="${resetUrl}" style="color: #8b5cf6; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
              If you did not request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <div style="background: #070a12; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #475569; font-size: 12px; margin: 0;">SkillSphere Campus Collaboration Platform</p>
          </div>
        </div>
      `
    });

    console.log(`✅ Password reset email sent to ${recipient.email}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send password reset email to ${recipient.email}:`, err.message);
    return { sent: false, error: err.message };
  }
};

/**
 * 4. Notification Email when Join Request or Invitation is Accepted/Rejected
 */
const sendDecisionEmail = async ({ recipient, project, decision, senderName }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: getSmtpNotConfiguredReason() };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const isAccepted = decision === 'ACCEPTED';
  const statusColor = isAccepted ? '#10b981' : '#ef4444';

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: recipient.email,
      subject: `${isAccepted ? '🎉 Accepted' : 'Update'}: Application for "${project.title}"`,
      text: `Hello ${recipient.name},\n\nYour application/invite for "${project.title}" was ${decision.toLowerCase()}.\n\nBest,\nSkillSphere Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: ${statusColor}; padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">SkillSphere</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">Application Status Update</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #e2e8f0; margin-top: 0;">Hi <strong>${recipient.name}</strong>,</p>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
              ${isAccepted
                ? `Congratulations! You have been accepted into the team for <strong>${project.title}</strong>.`
                : `Thank you for your interest. Your request to join <strong>${project.title}</strong> was not accepted at this time.`
              }
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${frontendUrl}/projects/${project._id || ''}" style="background: #1e293b; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; border: 1px solid #334155; display: inline-block;">
                View Project Details
              </a>
            </div>
          </div>
        </div>
      `
    });

    console.log(`✅ Decision email sent to ${recipient.email}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send decision email to ${recipient.email}:`, err.message);
    return { sent: false, error: err.message };
  }
};

module.exports = {
  sendInvitationEmail,
  sendJoinRequestEmail,
  sendDecisionEmail,
  sendPasswordResetEmail
};
