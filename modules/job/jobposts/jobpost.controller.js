const JobPost = require('./jobpost.model');

/**
 * Create job post (Admin only)
 */
createJobPost = async (req, res) => {
    try {
        // ✅ Validate sites array exists
        if (!req.body.sites || !Array.isArray(req.body.sites)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Sites array is required' 
            });
        }

        // ✅ Validate locations array exists and not empty
        if (!req.body.locations || !Array.isArray(req.body.locations) || req.body.locations.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least one location is required' 
            });
        }

        // ✅ Create job post (Mongoose will handle case normalization and validation)
        const jobPost = await JobPost.create(req.body);

        res.status(201).json({ success: true, data: jobPost });
    } catch (error) {
        // 🔴 Handle validation errors with clear messages
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation Error',
                errors: errors 
            });
        }
        
        // 🔴 Handle other errors
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Get all job posts (site-based)
 */
const ALLOWED_JOB_FILTERS = [
  'title',
  'department',
  'type',
  'status',
  'Experience'
];

const buildJobPostFilter = (query, site) => {
  const filter = {
    sites: { $in: [site] } // 🔐 Site-based filtering enforced
  };

  // ✅ Loop through query parameters and apply allowed filters
  for (const key in query) {
    if (!ALLOWED_JOB_FILTERS.includes(key)) continue;

    const value = query[key];

    // 🔍 Case-insensitive partial search for title
    if (key === 'title') {
      filter.title = { $regex: value, $options: 'i' };
    } else {
      filter[key] = value;
    }
  }

  // 🔍 Location-based filtering (nested array queries)
  if (query.city || query.country || query.workType) {
    filter.locations = { $elemMatch: {} };

    if (query.city) {
      filter.locations.$elemMatch.city = query.city;
    }

    if (query.country) {
      filter.locations.$elemMatch.country = query.country;
    }

    if (query.workType) {
      filter.locations.$elemMatch.type = query.workType;
    }
  }

  // 🔎 Salary range filtering
  if (query.minSalary || query.maxSalary) {
    filter['salaryRange.min'] = {};
    if (query.minSalary) filter['salaryRange.min'].$gte = Number(query.minSalary);
    if (query.maxSalary) filter['salaryRange.max'].$lte = Number(query.maxSalary);
  }

  // 📅 Closing date filter (before a certain date)
  if (query.closingBefore) {
    filter.closingDate = { $lte: new Date(query.closingBefore) };
  }

  return filter;
};

getAllJobPosts = async (req, res) => {
    try {
        // ✅ Fetch active job posts for the current site
        const jobPosts = await JobPost.find({
            sites: { $in: [req.site] },
            status: 'Active' // 🔐 Business rule: only show active jobs
        }).sort({ createdAt: -1 }); // ⬇️ Newest first

        res.status(200).json({
            success: true,
            count: jobPosts.length,
            data: jobPosts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single job post (site-secure)
 */
getJobPostById = async (req, res) => {
    try {
        // ✅ Find job by ID and ensure it belongs to current site
        const jobPost = await JobPost.findOne({
            _id: req.params.id,
            sites: req.site
        });

        // 🔴 Not found error
        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found for this site'
            });
        }

        res.status(200).json({
            success: true,
            data: jobPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update job post (Admin) 
 */ 
updateJobPost = async (req, res) => {
    try {
        // ✅ Update and return new document with validation
        const jobPost = await JobPost.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        );

        // 🔴 Not found error
        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: jobPost
        });
    } catch (error) {
        // 🔴 Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation Error',
                errors: errors 
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete job post (Admin)
 */
deleteJobPost = async (req, res) => {
    try {
        // ✅ Find and delete job post
        const jobPost = await JobPost.findByIdAndDelete(req.params.id);

        // 🔴 Not found error
        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get metadata for job filters (dropdowns)
 */
const getJobMeta = async (req, res) => {
    try {
        // 1️⃣ Get unique locations from database
        const locationsAgg = await JobPost.aggregate([
            { $unwind: "$locations" }, // Flatten locations array
            { $group: { _id: null, uniqueLocations: { $addToSet: "$locations" } } }, // Get unique
            { $project: { _id: 0, uniqueLocations: 1 } } // Remove _id field
        ]);
        const locations = locationsAgg[0]?.uniqueLocations || [];

        // 2️⃣ Department options (from enum)
        const departments = [
            "Engineering", "Product", "Design", "Marketing", "Sales",
            "Business Development", "HR", "Finance", "Operations", "Quality Assurance"
        ];

        // 3️⃣ Status options
        const statusOptions = ["Active", "Inactive", "Closed", "Filled"];

        // 4️⃣ Job type options
        const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

        res.status(200).json({
            locations,
            departments,
            statusOptions,
            jobTypes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {  
    createJobPost,
    getAllJobPosts,
    getJobPostById,
    updateJobPost,
    deleteJobPost,
    getJobMeta
};