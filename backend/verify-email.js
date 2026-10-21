require('dotenv').config();
const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE || process.env.EMAIL_SECURE;

console.log('====================================================');
console.log('📬 SkillSphere Email Service Verification');
console.log('====================================================');
console.log(`SMTP Host: ${smtpHost}`);
console.log(`SMTP Port: ${smtpPort}`);
console.log(`SMTP User: ${smtpUser || 'Not set'}`);
console.log(`SMTP Pass: ${smtpPass ? '********' : 'Not set'}`);
console.log('----------------------------------------------------');

if (!smtpUser || !smtpPass) {
  console.error('❌ Error: Set SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS in backend/.env');
  process.exit(1);
}

if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
  console.error('❌ Error: SMTP_PORT/EMAIL_PORT must be a valid positive integer');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure === 'true' || (!smtpSecure && smtpPort === 465),
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

console.log('Testing connection to mail server...');

transporter.verify((err, success) => {
  if (err) {
    console.error('\n❌ SMTP Verification FAILED!');
    console.error('Error Details:', err.message);
    console.log('\n💡 KAISE THEEK KAREIN:');
    console.log('1. Apne Google Account me jayein: https://myaccount.google.com/security');
    console.log('2. "2-Step Verification" ON karein.');
    console.log('3. "App Passwords" search karein aur ek naya password banayein (e.g. app name: SkillSphere).');
    console.log('4. Google aapko 16-character ka code dega (e.g. abcd efgh ijkl mnop).');
    console.log('5. Us 16-character code ko backend/.env file me SMTP_PASS me daalein:');
    console.log('   SMTP_PASS=abcdefghijklmnop\n');
  } else {
    console.log('\n✅ SUCCESS! SMTP Server is connected and ready to send real emails to inboxes!');
  }
});
