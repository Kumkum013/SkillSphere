const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this GitHub ID
    let user = await User.findOne({ 'github.id': profile.id });

    if (user) {
      // Update GitHub data
      user.github.accessToken = accessToken;
      user.github.username = profile.username;
      user.github.profileUrl = profile.profileUrl;
      user.github.avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails?.[0]?.value });

    if (user) {
      // Link GitHub account to existing user
      user.github = {
        id: profile.id,
        username: profile.username,
        accessToken: accessToken,
        profileUrl: profile.profileUrl,
        avatarUrl: profile.photos?.[0]?.value || user.avatarUrl
      };
      await user.save();
      return done(null, user);
    }

    // Create new user (only if GitHub provides email)
    if (profile.emails && profile.emails.length > 0) {
      const newUser = new User({
        name: profile.displayName || profile.username,
        email: profile.emails[0].value,
        avatarUrl: profile.photos?.[0]?.value || '',
        password: '', // OAuth users don't need password
        role: 'STUDENT',
        github: {
          id: profile.id,
          username: profile.username,
          accessToken: accessToken,
          profileUrl: profile.profileUrl,
          avatarUrl: profile.photos?.[0]?.value
        }
      });

      await newUser.save();
      return done(null, newUser);
    }

    // Email not provided - cannot create user
    return done(null, false, { message: 'GitHub account must have a public email' });
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;
