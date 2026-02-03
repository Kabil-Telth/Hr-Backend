const AuthService = require('./appauth.service');

class AuthController {
  constructor() {
    this.authService = new AuthService();

    // Bind methods
    this.getToken = this.getToken.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  // 🔐 Get access token
  async getToken(req, res) {
    try {
      const token = await this.authService.getAccessToken();
      return res.status(200).json({
        success: true,
        accessToken: token,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ✅ Validate current token
  async validateToken(req, res) {
    try {
      const isValid = await this.authService.validateToken();
      return res.status(200).json({
        success: true,
        valid: isValid,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 🔄 Force refresh token
  async refreshToken(req, res) {
    try {
      const token = await this.authService.refreshToken();
      return res.status(200).json({
        success: true,
        accessToken: token,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
