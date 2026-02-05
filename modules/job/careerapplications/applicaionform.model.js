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

// ✅ Helper function to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const applicationSchema = new mongoose.Schema(
  {
    // Job Details
    JobID: {
      type: String,
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
      type: String, // Format: YYYY-MM-DD
      required: true,
      validate: {
        validator: function (dob) {
          // ✅ Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(dob)) {
            return false;
          }

          // ✅ Validate age >= 18
          const age = calculateAge(dob);
          return age >= 18;
        },
        message: 'Candidate must be at least 18 years old'
      }
    },
    Age: {
  type: Number
},
    Email: {
      type: String,
      required: true,
      lowercase: true,
      unique:true,
      trim: true,
      validate: {
        validator: function (email) {
          // ✅ Basic email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format'
      }
    },
    Phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique:true,
      validate: {
        validator: function (value) {
          const patterns = [
            // 🇮🇳 India
            /^(\+91|91)?[6-9]\d{9}$/,

            // 🇬🇧 UK
            /^\+44\d{10}$/,

            // 🇺🇸 US
            /^\+1\d{10}$/,

            // 🇨🇳 China
            /^\+86[1]\d{10}$/,

            // 🌍 Other countries (E.164, max 15 digits)
            /^\+\d{1,3}\d{6,12}$/
          ];

          return patterns.some((regex) => regex.test(value));
        },
        message: 'Please enter a valid phone number Based on your country)'
      }
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
      default: 0,
      min: [0, 'Years of experience cannot be negative']
    },
    Currentsalary: {
      type: Number,
      min: [0, 'Current salary cannot be negative']
    },
    ExpectedSalary: {
      type: Number,
      min: [0, 'Expected salary cannot be negative']
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
      type: String,
      validate: {
        validator: function (url) {
          if (!url) return true; // Optional field
          return /^https?:\/\/(www\.)?linkedin\.com\/.+$/.test(url);
        },
        message: 'Invalid LinkedIn URL'
      }
    },
    PortfolioURL: {
      type: String,
      validate: {
        validator: function (url) {
          if (!url) return true; // Optional field
          return /^https?:\/\/.+\..+/.test(url);
        },
        message: 'Invalid Portfolio URL'
      }
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
    timestamps: true,
    toJSON: { virtuals: true }, // ✅ Include virtuals when converting to JSON
    toObject: { virtuals: true }
  }
);

applicationSchema.index(
  { Email: 1, Phone: 1, JobID: 1 },
  { unique: true, name: 'unique_application_per_job' }
);

// ✅ Indexes for performance
applicationSchema.index({ Email: 1 });
applicationSchema.index({ ApplicationStatus: 1 });
applicationSchema.index({ AppliedDate: -1 });
applicationSchema.index({ JobID: 1 });

// ✅ Virtual: Calculate age dynamically (not stored in DB)
applicationSchema.virtual('age').get(function () {
  return calculateAge(this.DOB);
});

// ✅ Virtual: Check if recently applied (last 30 days)
applicationSchema.virtual('isRecent').get(function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.AppliedDate >= thirtyDaysAgo;
});

module.exports = mongoose.model('Application', applicationSchema); 