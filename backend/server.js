require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/services/config/db');
const { connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  connectRedis().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
});
