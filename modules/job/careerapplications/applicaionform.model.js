// const mongoose = require('mongoose');

// const applicationFormSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: [true, 'Full name is required'],
//     trim: true
//   },
//     email: {    
//         type: String,
//         required: [true, 'Email is required'],
//         lowercase: true,
//         trim: true,
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
//     },
//     phone: {
//   type: String,
//   required: [true, 'Phone number is required'],
//   trim: true,
//   match: [
//     /^(\+91|91)?[6-9]\d{9}$/,
//     'Please enter a valid Indian mobile number'
//   ]
// },
//     address: {
//         type: String,   
//         required: [true, 'Address is required'],
//         trim: true
//     },
//     resumeUrl: {
//         type: String,
//         required: [true, 'Resume URL is required']
//     },
//     coverLetter: {
//         type: String,
//         trim: true
//     },
//     jobPost: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'JobPost',
//         required: [true, 'Associated job post is required']
//     },
//     status: {
//         type: String,
//         enum: ['Submitted', 'Under Review', 'Interview Scheduled', 'Rejected', 'Hired'],
//         default: 'Submitted'
//     }
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('ApplicationForm', applicationFormSchema);
const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree: String,
    institution: String,
    graduationYear: Number
  },
  { _id: false }
);

const referenceSchema = new mongoose.Schema(
  {
    name: String,
    position: String,
    company: String,
    phone: String,
    email: String
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    // Job Details
    JobID: {
      type: String,
      required: true
    },
    JobTitle: {
      type: String,
      required: true
    },

    // Candidate Details
    CandidateName: {
      type: String,
      required: true,
      trim: true
    },
    DOB: {
      type: String, // YYYY-MM-DD (from frontend)
      required: true
    },
    Email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    Phone: {
      type: String,
      required: true
    },
    CurrentLocation: {
      type: String
    },
    WillingToRelocate: {
      type: Boolean,
      default: false
    },

    // Employment Info
    YearsOfExperience: {
      type: Number,
      default: 0
    },
    Currentsalary: {
      type: String
    },
    ExpectedSalary: {
      type: Number
    },
    NoticePeriod: {
      type: String
    },

    // Education
    Education: educationSchema,

    // Skills
    Skills: {
      type: [String],
      default: []
    },

    // Resume
    ResumeURL: {
      type: String,
      required: true
    },
    ResumeFileName: {
      type: String
    },

    // Links
    LinkedInURL: {
      type: String
    },
    PortfolioURL: {
      type: String
    },

    // Extra Info
    CoverLetter: {
      type: String
    },
    Notes: {
      type: String
    },

    // Source & References
    Source: {
      type: String,
      enum: ['Website', 'LinkedIn', 'Referral', 'Job Board', 'Other'],
      default: 'Website'
    },
    References: {
      type: [referenceSchema],
      default: []
    },

    // Dynamic questions
    CustomAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Status & Dates
    ApplicationStatus: {
      type: String,
      enum: [
        'Pending',
        'Reviewing',
        'Interview',
        'Accepted',
        'Rejected',
        'Onhold-for future'
      ],
      default: 'Pending'
    },
    AppliedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
applicationSchema.index({ Email: 1 });
applicationSchema.index({ ApplicationStatus: 1 });
applicationSchema.index({ AppliedDate: -1 });

// Virtual: recently applied (last 30 days)
applicationSchema.virtual('isRecent').get(function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.AppliedDate >= thirtyDaysAgo;
});

module.exports = mongoose.model('Application', applicationSchema);
