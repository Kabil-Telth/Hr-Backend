// Create auth.middleware.js
const AuthService = require('./appauth.service');

const sharePointAuth = async (req, res, next) => {
  try {
    const authService = new AuthService();
    req.sharePointToken = await authService.getAccessToken();
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'SharePoint authentication failed',
      message: error.message 
    });
  }
};

module.exports = sharePointAuth;
