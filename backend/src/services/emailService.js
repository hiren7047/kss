const nodemailer = require('nodemailer');
const { email: emailConfig, nodeEnv, frontendBaseUrl } = require('../config/env');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');

let transporter;

function createTransporter() {
  if (!emailConfig.user || !emailConfig.pass) {
    console.warn('[emailService] SMTP credentials are not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
}

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

function buildFromHeader() {
  const fromName = emailConfig.fromName || 'KSS';
  const fromAddress = emailConfig.fromAddress || emailConfig.user;
  return fromName ? `${fromName} <${fromAddress}>` : fromAddress;
}

/**
 * Low-level helper: send a basic email using Gmail SMTP (or configured SMTP).
 */
async function sendEmail({ to, subject, html, text, replyTo }) {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    if (nodeEnv !== 'production') {
      console.log('[emailService] Skipping email send in non-production without SMTP config:', {
        to,
        subject,
      });
      return;
    }
    throw new Error('SMTP is not configured');
  }

  const mailOptions = {
    from: buildFromHeader(),
    to,
    subject,
    html,
    text,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  const info = await activeTransporter.sendMail(mailOptions);

  if (nodeEnv !== 'production') {
    console.log('[emailService] Email sent:', info.messageId);
  }

  return info;
}

/**
 * Replace variables in template string using {{var}} syntax.
 */
function renderTemplateString(template, variables = {}) {
  if (!template) return '';
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return variables[key] ?? '';
    }
    return '';
  });
}

/**
 * Send email using stored EmailTemplate by code.
 *
 * @param {Object} options
 * @param {string} options.templateCode - Template code (e.g., NEWSLETTER_GENERAL)
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {Object} [options.variables] - Variables for interpolation
 * @param {Object} [options.meta] - Additional meta data for logging
 * @param {string} [options.replyTo] - Reply-to email
 * @param {Object} [options.user] - User performing action (for createdBy in EmailLog)
 */
async function sendTemplatedEmail({
  templateCode,
  to,
  variables = {},
  meta = {},
  replyTo,
  user,
}) {
  const template = await EmailTemplate.findOne({
    code: templateCode.toUpperCase(),
    status: 'active',
    softDelete: false,
  });

  if (!template) {
    throw new Error(`Email template not found or inactive: ${templateCode}`);
  }

  // Add some default variables
  const fullVariables = {
    ...variables,
    orgName: emailConfig.fromName || 'KSS',
    frontendBaseUrl,
  };

  const subject = renderTemplateString(template.subject, fullVariables);
  const html = renderTemplateString(template.bodyHtml, fullVariables);
  const text = template.bodyText
    ? renderTemplateString(template.bodyText, fullVariables)
    : undefined;

  let status = 'sent';
  let errorMessage = null;
  let info = null;

  try {
    info = await sendEmail({ to, subject, html, text, replyTo });
  } catch (error) {
    status = 'failed';
    errorMessage = error.message || 'Failed to send email';
    if (nodeEnv !== 'production') {
      console.error('[emailService] Failed to send templated email:', error);
    }
  }

  // Save log (even if failed)
  const log = await EmailLog.create({
    templateId: template._id,
    templateCode: template.code,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    status,
    errorMessage,
    meta,
    sentAt: new Date(),
    createdBy: user ? user._id : null,
  });

  // Update template usage
  await EmailTemplate.updateOne(
    { _id: template._id },
    {
      $inc: { usageCount: 1 },
      $set: { lastUsedAt: new Date() },
    }
  );

  if (status === 'failed') {
    throw new Error(errorMessage || 'Failed to send email');
  }

  return { info, log };
}

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  renderTemplateString,
};


