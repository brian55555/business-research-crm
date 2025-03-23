// server.js - Main application file
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
// const { Strategy } = require('passport-azure-ad-oauth2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const notesRoutes = require('./routes/notes');
const documentsRoutes = require('./routes/documents');
const tasksRoutes = require('./routes/tasks');
const newsRoutes = require('./routes/news');
const contactsRoutes = require('./routes/contacts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.set('trust proxy', true); 


// Configure passport
app.use(passport.initialize());
app.use(passport.session());

// Azure AD OAuth strategy for OneDrive integration
/*
passport.use(new Strategy({
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}api/auth/microsoft/callback`,
    tenant: process.env.AZURE_TENANT_ID
  },
  (accessToken, refreshToken, params, profile, done) => {
    // Decode the id_token to get user information
    const decodedToken = jwt.decode(params.id_token);
    
    // Find or create user
    User.findOne({ email: decodedToken.email })
      .then(user => {
        if (user) {
          // Update tokens
          user.microsoftAccessToken = accessToken;
          user.microsoftRefreshToken = refreshToken;
          return user.save();
        } else {
          // Create new user
          const newUser = new User({
            email: decodedToken.email,
            name: decodedToken.name,
            microsoftAccessToken: accessToken,
            microsoftRefreshToken: refreshToken
          });
          return newUser.save();
        }
      })
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  }
));
*/
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contacts', contactsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
