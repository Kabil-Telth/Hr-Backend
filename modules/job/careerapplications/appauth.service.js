const axios = require('axios');

class AuthService {
  constructor() {
    this.tenantId = process.env.TENANT_ID
    this.clientId = process.env.CLIENT_ID
    this.clientSecret = process.env.CLIENT_SECRET;
    this.tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    this.scope = 'https://graph.microsoft.com/.default';
    
    this.accessToken = null;
    this.tokenExpiry = null;
    console.log(this.tenantId)
  }

  // Get access token using client credentials flow
 async getAccessToken() {
  try {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // 🔍 Check this part
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('scope', this.scope);
    params.append('grant_type', 'client_credentials');

    // 🔍 DEBUG - Add this temporarily
    console.log('📤 Sending to Azure:');
    console.log('client_id:', this.clientId);
    console.log('client_secret length:', this.clientSecret?.length);
    console.log('scope:', this.scope);
    console.log('grant_type:', 'client_credentials');

    const response = await axios.post(this.tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

    console.log('✅ Access token obtained successfully');
    return this.accessToken;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to obtain access token');
  }
}

  // Validate current token
  async validateToken() {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      return false;
    }
    return true;
  }

  // Refresh token
  async refreshToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    return await this.getAccessToken();
  }
}

module.exports = AuthService;