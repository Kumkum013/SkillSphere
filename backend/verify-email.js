require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('====================================================');
console.log('📬 SkillSphere Email Service Verification');
console.log('====================================================');
console.log(`SMTP Host: ${process.env.SMTP_HOST || 'Not set'}`);
console.log(`SMTP Port: ${process.env.SMTP_PORT || '587'}`);
console.log(`SMTP User: ${process.env.SMTP_USER || 'Not set'}`);
console.log(`SMTP Pass: ${process.env.SMTP_PASS ? '********' : 'Not set'}`);
console.log('----------------------------------------------------');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ Error: SMTP_USER or SMTP_PASS is missing in backend/.env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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
