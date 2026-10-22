require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing Email Configuration...\n');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Test 1: Current configuration
console.log('\n=== Test 1: Current Configuration (TLS on port 587) ===');
async function testConfig1() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Test 1 PASSED: Connection successful');
    return true;
  } catch (err) {
    console.log('❌ Test 1 FAILED:', err.message);
    return false;
  }
}

// Test 2: SSL on port 465
console.log('\n=== Test 2: SSL on port 465 ===');
async function testConfig2() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Test 2 PASSED: Connection successful');
    return true;
  } catch (err) {
    console.log('❌ Test 2 FAILED:', err.message);
    return false;
  }
}

// Test 3: With additional options
console.log('\n=== Test 3: With Additional Options ===');
async function testConfig3() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Test 3 PASSED: Connection successful');
    return true;
  } catch (err) {
    console.log('❌ Test 3 FAILED:', err.message);
    return false;
  }
}

async function runTests() {
  const test1 = await testConfig1();
  const test2 = await testConfig2();
  const test3 = await testConfig3();

  console.log('\n=== Summary ===');
  console.log('Test 1 (TLS 587):', test1 ? '✅' : '❌');
  console.log('Test 2 (SSL 465):', test2 ? '✅' : '❌');
  console.log('Test 3 (TLS + extra opts):', test3 ? '✅' : '❌');

  if (!test1 && !test2 && !test3) {
    console.log('\n⚠️  All tests failed. Possible issues:');
    console.log('1. App password is incorrect or revoked');
    console.log('2. 2FA is not enabled on the Gmail account');
    console.log('3. Less secure apps access is blocked');
    console.log('4. Gmail account is blocking the sign-in attempt');
    console.log('\n💡 Try generating a new app password at: https://myaccount.google.com/apppasswords');
  }
}

runTests();
