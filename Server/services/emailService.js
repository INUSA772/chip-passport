const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const roleLabels = {
  records_clerk: 'Records Clerk',
  nurse: 'Nurse',
  clinician: 'Clinician',
  dentist: 'Dentist',
  it_admin: 'IT Admin',
};

async function sendStaffCredentials({ toEmail, fullName, staffId, password, role }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  if (!toEmail) {
    throw new Error('Staff email is required to send credentials.');
  }

  const transporter = createTransporter();

  const roleLabel = roleLabels[role] || role;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your QECH Health Passport staff account',
    text: `
Hello ${fullName},

An account has been created for you on the QECH Chip-Based Health Passport system.

Staff ID: ${staffId}
Role: ${roleLabel}
Temporary password: ${password}

Please sign in and change your password after first login.

This message was sent by the hospital IT system.
    `.trim(),
    html: `
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>An account has been created for you on the <strong>QECH Chip-Based Health Passport</strong> system.</p>
      <ul>
        <li><strong>Staff ID:</strong> ${staffId}</li>
        <li><strong>Role:</strong> ${roleLabel}</li>
        <li><strong>Temporary password:</strong> ${password}</li>
      </ul>
      <p>Please sign in and change your password after first login.</p>
      <p style="color:#666;font-size:12px;">This message was sent by the hospital IT system.</p>
    `,
  });

  return info;
}

module.exports = { sendStaffCredentials };