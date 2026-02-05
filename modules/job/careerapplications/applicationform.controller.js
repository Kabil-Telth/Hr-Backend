const Application = require('./applicaionform.model');

/**
 * CREATE Application
 * POST /api/applications
 */
const createApplication = async (req, res) => {
  try {
    // ✅ Manual check before creation (optional but provides better error message)
    const existingApplication = await Application.findOne({
      Email: req.body.Email,
      Phone: req.body.Phone,
      JobID: req.body.JobID
    });

    if (existingApplication) {
      return res.status(409).json({  // 409 = Conflict
        success: false,
        message: 'You have already applied for this position',
        details: {
          applicationId: existingApplication._id,
          appliedDate: existingApplication.AppliedDate,
          status: existingApplication.ApplicationStatus
        }
      });
    }

    // Create new application
    const application = await Application.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    // ✅ Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this position',
        error: 'Duplicate application detected'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to create application',
      error: error.message
    });
  }
};

/**
 * GET ALL Applications (with filters)
 * GET /api/applications
 */
const ALLOWED_FILTERS = [
  'ApplicationStatus',
  'JobID',
  'Email',
  'Source',
  'CandidateName',
  'JobTitle',
  'YearsOfExperience',
  'CurrentLocation'
];

const buildFilter = (query) => {
  const filter = {};

  for (const key in query) {
    if (!ALLOWED_FILTERS.includes(key)) continue;

    let value = query[key];

    // Normalize
    if (key === 'Email') {
      value = value.toLowerCase();
    }

    // Partial search for strings
    if (typeof value === 'string' && !['JobID', 'Source', 'ApplicationStatus'].includes(key)) {
      filter[key] = { $regex: value, $options: 'i' };
    } else {
      filter[key] = value;
    }
  }

  return filter;
};


const getApplications = async (req, res) => {
  try {
    const filter = buildFilter(req.query);

    const pageNumber = 1;
    const pageSize = 20;
    const skip = (pageNumber - 1) * pageSize;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ AppliedDate: -1 })
        .skip(skip)
        .limit(pageSize),
      Application.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        pageSize
      },
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications list',
      error: error.message
    });
  }
};



/**
 * GET Application by ID
 * GET /api/applications/:id
 */
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

/**
 * UPDATE Application
 * PUT /api/applications/:id
 */
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
};

/**
 * DELETE Application
 * DELETE /api/applications/:id
 */
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};

/**
 * UPDATE Application Status (HR flow)
 * PATCH /api/applications/:id/status
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { ApplicationStatus, Notes } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { ApplicationStatus, Notes },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET Applications by Job ID
 * GET /api/applications/job/:jobId
 */
const getApplicationsByJob = async (req, res) => {
  try {
    const applications = await Application
      .find({ JobID: req.params.jobId })
      .sort({ AppliedDate: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/* ===========================
   MODULE EXPORTS (IMPORTANT)
   =========================== */

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  getApplicationsByJob
};
