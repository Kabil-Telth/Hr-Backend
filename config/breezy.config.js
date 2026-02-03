// config/breezy.config.js
module.exports = {
  breezy: {
    breezybaseURL: 'https://api.breezy.hr/v3',
    apiKey: process.env.BREEZY_API_KEY,
    companyId: process.env.BREEZY_COMPANY_ID,
    // Rate limiting
    rateLimit: {
      maxRequests: 100,
      perMinutes: 2
    }
  }
};