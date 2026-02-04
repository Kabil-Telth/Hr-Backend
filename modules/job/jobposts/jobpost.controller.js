const JobPost = require('./jobpost.model');

/**
 * Create job post (Admin only)
 */
createJobPost = async (req, res) => {
    try {
        // Validate sites array
        if (!req.body.sites || !Array.isArray(req.body.sites)) {
            return res.status(400).json({ success: false, message: 'Sites array is required' });
        }

        // Validate locations array
        if (!req.body.locations || !Array.isArray(req.body.locations) || req.body.locations.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one location is required' });
        }

        // Optionally, validate enum values here for city/country/type
        const allowedCities = ["Chennai", "Salem", "Delhi", "London", "Remote"];
        const allowedCountries = ["India", "UK", "USA", "Global"];
        const allowedTypes = ["Onsite", "Hybrid", "Remote"];

        for (const loc of req.body.locations) {
            if (!allowedCities.includes(loc.city) || !allowedCountries.includes(loc.country) || !allowedTypes.includes(loc.type)) {
                return res.status(400).json({ success: false, message: `Invalid location: ${loc.city}, ${loc.country}, ${loc.type}` });
            }
        }

        const jobPost = await JobPost.create(req.body);

        res.status(201).json({ success: true, data: jobPost });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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
    sites: { $in: [site] } // 🔐 enforced
  };

  for (const key in query) {
    if (!ALLOWED_JOB_FILTERS.includes(key)) continue;

    const value = query[key];

    // Partial search for title
    if (key === 'title') {
      filter.title = { $regex: value, $options: 'i' };
    } else {
      filter[key] = value;
    }
  }

  // 🔍 Location-based filtering (nested array)
  if (query.city || query.country || query.workType) {
    filter.locations = {
      $elemMatch: {}
    };

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

  // 🔎 Salary range (optional)
  if (query.minSalary || query.maxSalary) {
    filter['salaryRange.min'] = {};
    if (query.minSalary) filter['salaryRange.min'].$gte = Number(query.minSalary);
    if (query.maxSalary) filter['salaryRange.max'].$lte = Number(query.maxSalary);
  }

  // 📅 Closing date
  if (query.closingBefore) {
    filter.closingDate = { $lte: new Date(query.closingBefore) };
  }

  return filter;
};



getAllJobPosts = async (req, res) => {
    try {
        const jobPosts = await JobPost.find({
            sites: { $in: [req.site] },
            status: 'Active' // 🔐 optional business rule
        }).sort({ createdAt: -1 });

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
        const jobPost = await JobPost.findOne({
            _id: req.params.id,
            sites: req.site
        });

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
        const jobPost = await JobPost.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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
        const jobPost = await JobPost.findByIdAndDelete(req.params.id);

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

const getJobMeta = async (req, res) => {
    try {
        // 1️⃣ Locations: flatten array of objects and get unique entries
        const locationsAgg = await JobPost.aggregate([
            { $unwind: "$locations" },
            { $group: { _id: null, uniqueLocations: { $addToSet: "$locations" } } },
            { $project: { _id: 0, uniqueLocations: 1 } }
        ]);
        const locations = locationsAgg[0]?.uniqueLocations || [];

        // 2️⃣ Departments: static from enum
        const departments = [
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
        ];

        // 3️⃣ Status options
        const statusOptions = ["Active", "Inactive", "Closed", "Filled"];

        // 4️⃣ Job types
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