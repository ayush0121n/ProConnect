const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 100 },
  company:     { type: String, required: [true, 'Company name is required'], trim: true },
  companyLogo: { url: String, publicId: String },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  description:      { type: String, required: [true, 'Job description is required'], maxlength: 5000 },
  requirements:     { type: String, maxlength: 3000 },
  responsibilities: { type: String, maxlength: 3000 },

  location: {
    city:     String,
    state:    String,
    country:  String,
    isRemote: { type: Boolean, default: false }
  },

  jobType:       { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'], required: true },
  workplaceType: { type: String, enum: ['on-site', 'remote', 'hybrid'], default: 'on-site' },

  experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'lead', 'executive'], required: true },
  minExperience:   Number,
  maxExperience:   Number,

  salary: {
    min:          Number,
    max:          Number,
    currency:     { type: String, default: 'USD' },
    period:       { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
    isNegotiable: { type: Boolean, default: false }
  },

  skills:    [{ type: String, trim: true }],
  education: { type: String, enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'any'] },

  applications: [{
    applicant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt:   { type: Date, default: Date.now },
    status:      { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'], default: 'pending' },
    resume:      { url: String, publicId: String },
    coverLetter: String
  }],
  applicationsCount: { type: Number, default: 0 },

  status:              { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  applicationDeadline: Date,
  views:               { type: Number, default: 0 }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });
jobSchema.index({ jobType: 1, status: 1 });
jobSchema.index({ 'location.country': 1 });
jobSchema.index({ createdAt: -1 });
// postedBy already indexed by `index: true` in schema definition
jobSchema.index({ experienceLevel: 1 });

module.exports = mongoose.model('Job', jobSchema);
