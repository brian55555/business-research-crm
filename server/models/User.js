// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.microsoftAccessToken;
    }
  },
  microsoftAccessToken: String,
  microsoftRefreshToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hash middleware
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password verification
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

// models/Business.js
const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  industry: String,
  website: String,
  description: String,
  size: String,
  founded: Date,
  headquarters: String,
  revenue: String,
  contacts: [{
    name: String,
    position: String,
    email: String,
    phone: String,
    linkedin: String
  }],
  tags: [String],
  stage: {
    type: String,
    enum: ['Researching', 'Contacting', 'Meeting', 'Negotiating', 'Closed', 'Not Interested'],
    default: 'Researching'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

BusinessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Business', BusinessSchema);