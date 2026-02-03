const express = require('express');
const router = express.Router();
const applicationFormController=require('./applicationform.controller');
const isAdmin = require('./admin.middleware');
const authenticate = require('../../auth/auth.middleware');




router.post('/submitapplication',applicationFormController.createApplication);
router.get('/Applicationlists', authenticate,isAdmin,applicationFormController.getApplications);
router.get('/Applicationlist/:id', authenticate,isAdmin,applicationFormController.getApplicationById);

module.exports=router; 

// module.exports = {
//   createApplication,
//   getApplications,
//   getApplicationById,
//   updateApplication,
//   deleteApplication,
//   updateApplicationStatus,
//   getApplicationsByJob
// };