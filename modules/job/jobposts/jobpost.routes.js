const express = require('express');
const router = express.Router();
const jobPostController = require('./jobpost.controller');
const {
    detectSite,
    validateObjectId,
    allowOnlyMyTelthToCreate
} = require('./jobpost.middleware');
const isAdmin = require('./admin.middleware');
const authenticate = require('../../auth/auth.middleware');

// CREATE → ONLY mytelth
router.post(
    '/createpost',
    // detectSite,
    authenticate,
    isAdmin,
    // allowOnlyMyTelthToCreate,
    jobPostController.createJobPost
);

// GET ALL → site-based visibility
router.get(
    '/getposts',
    // detectSite,
    jobPostController.getAllJobPosts
); 

// GET ONE → site-secure
router.get(
    '/getpostid/:id',
    // detectSite,
    // validateObjectId,
    jobPostController.getJobPostById
);

router.get(
    '/getjobmeta',
    // detectSite,
    jobPostController.getJobMeta
);

// // UPDATE / DELETE → admin logic (optional site restriction)
// router.put('/updatepost/:id', detectSite, authenticate, validateObjectId, isAdmin, jobPostController.updateJobPost);
// router.delete('/deletepost/:id', detectSite, authenticate,isAdmin, validateObjectId, jobPostController.deleteJobPost);

router.put('/updatepost/:id',  authenticate, isAdmin, jobPostController.updateJobPost);
router.delete('/deletepost/:id', authenticate,isAdmin,  jobPostController.deleteJobPost);

module.exports = router;