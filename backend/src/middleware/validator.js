// Input validation and NoSQL sanitization middleware

// Recursively sanitize objects to prevent MongoDB Operator Injection (e.g. { "$gt": "" })
const sanitizeNoSql = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);

  next();
};

// Validate user registration payload
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
    errors.push('Role must be STUDENT, FACULTY, or ADMIN');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

// Validate user login payload
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};

// Validate forgot password request
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  next();
};

// Validate reset password request
const validateResetPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  next();
};

// Validate project creation
const validateCreateProject = (req, res, next) => {
  const { title, description, requiredSkills, minMatchScore } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    errors.push('At least one required skill must be specified');
  }

  if (minMatchScore !== undefined && (minMatchScore < 0 || minMatchScore > 100)) {
    errors.push('minMatchScore must be between 0 and 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = {
  sanitizeNoSql,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateProject
};
