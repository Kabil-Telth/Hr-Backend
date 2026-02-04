const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
       lowercase: true,
        trim: true,
      trim: true
    },

    posterLink: {
      type: String
    },

    description: {
      type: String,
      required: true
    },
    Experience:{
      type: String,
    },

    // Locations as array of objects
    locations: {
      type: [
        {
          city: {
            type: String,
            required: true,
             lowercase: true,
        trim: true,
            enum: [
              "Chennai", 
              "Salem",
              "Delhi",
              "London",
              "Remote",               
            ]
          },
          country: {
            type: String,
            required: true,
             lowercase: true,
        trim: true,
            enum: [
              "India",
              "UK",
              "USA",
              "Global"
            ]
          },
          type: {
            type: String,
            required: true,
             lowercase: true,
        trim: true,
            enum: ["Onsite", "Hybrid", "Remote"]
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
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"]
    },

    department: {
      type: String,
      required: true,
      enum: [
        "Engineering",
        "Product",
        "Design",
        "Marketing",
        "Sales",
        "Business Development",
        "HR",
        "Finance",
        "Operations",
        "Quality Assurance"
      ]
    },

    salaryRange: {
      min: {
        type: Number,
        required: [true, "Minimum salary is required"]
      },
      max: {
        type: Number,
        required: [true, "Maximum salary is required"]
      }
    },

    closingDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Closed", "Filled"],
      default: "Active"
    },

    sites: {
      type: [String],
      enum: ["telth", "mytelth", "telthcare", "natlife","telthorg","medpass","telth.ai"],
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
