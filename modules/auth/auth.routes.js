const express = require('express');
const router = express.Router();

const signup = require('./signup');
const signin = require('./sigin'); // Check filename: signin.js or sigin.js
const refresh = require('./refresh');
const forgetPassword = require('./forgetPassword');
const resetPassword = require('./resetPassword');
const changePassword = require('./changePassword');
const authMiddleware = require('./auth.middleware'); // Your existing middleware
const isAdmin = require('../job/jobposts/admin.middleware');

const AuthController= require('../job/careerapplications/msauthtoken.controller');
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refresh);
router.post('/appaccess',authMiddleware, AuthController.getToken);
router.get('/msauthtoken',AuthController.getToken); 
router.post('/forgot-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authMiddleware, changePassword);


module.exports = router; 