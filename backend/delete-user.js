require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const emailsToDelete = [
  'kumkum2317@gmail.com',
  'kumarik23622@gmail.com'
];

async function deleteUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const email of emailsToDelete) {
      console.log(`\nSearching for user: ${email}`);
      const user = await User.findOne({ email: email });

      if (!user) {
        console.log(`❌ User ${email} not found in database`);
        continue;
      }

      console.log(`Found user: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
      console.log(`ID: ${user._id}`);

      await User.deleteOne({ email: email });
      console.log(`✅ User ${email} deleted successfully`);
    }

    console.log('\n✅ All specified users deleted successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

deleteUser();
