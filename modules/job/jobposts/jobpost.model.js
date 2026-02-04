const mongoose = require('mongoose');

// Helper function to normalize case-insensitive values
const normalizeEnum = (value, allowedValues) => {
  if (!value) return value;
  const normalized = allowedValues.find(
    val => val.toLowerCase() === value.toLowerCase()
  );
  return normalized || value; // Return original if no match (will trigger validation error)
};

const jobPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    posterLink: {
      type: String
    },

    description: {
      type: String,
      required: true
    },
    
    Experience: {
      type: String,
    },

    locations: {
      type: [
        {
          city: {
            type: String,
            required: true,
            trim: true,
            // Auto-capitalize first letter before saving
            set: function(value) {
              const cities = ["Chennai", "Salem", "Delhi", "London", "Remote"];
              return normalizeEnum(value, cities);
            },
            enum: {
              values: ["Chennai", "Salem", "Delhi", "London", "Remote"],
              message: 'Invalid city. Allowed values: Chennai, Salem, Delhi, London, Remote'
            }
          },
          country: {
            type: String,
            required: true,
            trim: true,
            set: function(value) {
              const countries = ["India", "UK", "USA", "Global"];
              return normalizeEnum(value, countries);
            },
            enum: {
              values: ["India", "UK", "USA", "Global"],
              message: 'Invalid country. Allowed values: India, UK, USA, Global'
            }
          },
          type: {
            type: String,
            required: true,
            trim: true,
            set: function(value) {
              const types = ["Onsite", "Hybrid", "Remote"];
              return normalizeEnum(value, types);
            },
            enum: {
              values: ["Onsite", "Hybrid", "Remote"],
              message: 'Invalid work type. Allowed values: Onsite, Hybrid, Remote'
            }
          }
        }
      ],
      required: true,
      validate: {
        validator: v => Array.isArray(v) && v.length > 0,
        message: "At least one location is required"
      }
    },

    type: {
      type: String,
      required: true,
      trim: true,
      set: function(value) {
        const types = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
        return normalizeEnum(value, types);
      },
      enum: {
        values: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
        message: 'Invalid job type. Allowed values: Full-time, Part-time, Contract, Internship, Freelance'
      }
    },

    department: {
      type: String,
      required: true,
      trim: true,
      set: function(value) {
        const departments = [
          "Engineering", "Product", "Design", "Marketing", "Sales",
          "Business Development", "HR", "Finance", "Operations", "Quality Assurance"
        ];
        return normalizeEnum(value, departments);
      },
      enum: {
        values: [
          "Engineering", "Product", "Design", "Marketing", "Sales",
          "Business Development", "HR", "Finance", "Operations", "Quality Assurance"
        ],
        message: 'Invalid department. Check allowed department values'
      }
    },

    salaryRange: {
      min: {
        type: Number,
        required: [true, "Minimum salary is required"]
      },
      max: {
        type: Number,
        required: [true, "Maximum salary is required"],
        validate: {
          validator: function(value) {
            return value >= this.salaryRange.min;
          },
          message: 'Maximum salary must be greater than or equal to minimum salary'
        }
      }
    },

    closingDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'Closing date must be in the future'
      }
    },

    status: {
      type: String,
      trim: true,
      set: function(value) {
        const statuses = ["Active", "Inactive", "Closed", "Filled"];
        return normalizeEnum(value, statuses);
      },
      enum: {
        values: ["Active", "Inactive", "Closed", "Filled"],
        message: 'Invalid status. Allowed values: Active, Inactive, Closed, Filled'
      },
      default: "Active"
    },

    sites: {
      type: [String],
      enum: {
        values: ["telth", "mytelth", "telthcare", "natlife", "telthorg", "medpass"],
        message: 'Invalid site. Allowed values: telth, mytelth, telthcare, natlife, telthorg, medpass'
      },
      required: true,
      index: true,
      validate: {
        validator: v => Array.isArray(v) && v.length > 0,
        message: "At least one site is required"
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobPost", jobPostSchema);