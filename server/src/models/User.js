const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true, minlength: 2, maxlength: 50 },
  lastName:  { type: String, required: [true, 'Last name is required'],  trim: true, minlength: 2, maxlength: 50 },
  email: {
    type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },

  // Profile
  profilePicture: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  coverImage:     { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  headline: { type: String, maxlength: 120, default: '' },
  bio:      { type: String, maxlength: 2000, default: '' },
  location: { city: String, country: String },

  // Contact
  phone:   { type: String, default: '' },
  website: { type: String, default: '' },

  // Social Links
  socialLinks: {
    linkedin:  { type: String, default: '' },
    github:    { type: String, default: '' },
    twitter:   { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },

  // Professional
  currentPosition: { type: String, default: '' },
  company:         { type: String, default: '' },
  industry:        { type: String, default: '' },

  // Skills
  skills: [{
    name: { type: String, required: true },
    endorsements: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, endorsedAt: { type: Date, default: Date.now } }]
  }],

  // Experience
  experience: [{
    title:       { type: String, required: true },
    company:     { type: String, required: true },
    location:    String,
    startDate:   { type: Date, required: true },
    endDate:     Date,
    isCurrent:   { type: Boolean, default: false },
    description: String
  }],

  // Education
  education: [{
    school:      { type: String, required: true },
    degree:      { type: String, required: true },
    fieldOfStudy: String,
    startDate:   { type: Date, required: true },
    endDate:     Date,
    grade:       String,
    description: String
  }],

  // Certifications
  certifications: [{
    name:          { type: String, required: true },
    issuer:        { type: String, required: true },
    issueDate:     Date,
    expiryDate:    Date,
    credentialId:  String,
    credentialUrl: String
  }],

  // Resume
  resume: { url: { type: String, default: '' }, publicId: { type: String, default: '' }, uploadedAt: Date },

  // Connections & Social
  connections:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionsCount: { type: Number, default: 0 },
  followers:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount:   { type: Number, default: 0 },
  following:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followingCount:   { type: Number, default: 0 },

  // Saved Items
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Account
  role:        { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
  accountType: { type: String, enum: ['free', 'premium'], default: 'free' },
  isVerified:  { type: Boolean, default: false },
  verificationToken:       String,
  verificationTokenExpire: Date,
  resetPasswordToken:      String,
  resetPasswordExpire:     Date,

  // Privacy
  profileVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },

  // Preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications:  { type: Boolean, default: true },
    jobAlerts:          { type: Boolean, default: true },
    newsletter:         { type: Boolean, default: false }
  },

  // Activity
  lastActive: { type: Date, default: Date.now },
  isOnline:   { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes (email already indexed by unique:true)
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ 'location.country': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ firstName: 'text', lastName: 'text', headline: 'text', company: 'text' });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
