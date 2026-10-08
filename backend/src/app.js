const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const todoRoutes = require('./routes/todoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const githubRoutes = require('./routes/githubRoutes');

const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeNoSql } = require('./middleware/validator');

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(sanitizeNoSql);

// Apply rate limiting to all /api/ endpoints
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.send('SkillSphere API running');
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/github', githubRoutes);

module.exports = app;