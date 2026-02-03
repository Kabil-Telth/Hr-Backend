const axios = require('axios');
const AuthService = require('../appauth.service');

const SITE_ID = process.env.SHAREPOINT_SITE_ID;
const RESUME_LIBRARY_ID = process.env.SHAREPOINT_RESUME_LIBRARY_ID;
const BASE_URL = process.env.GRAPH_API_BASE_URL;
const UPLOAD_FOLDER = '2026';  // Or use process.env.UPLOAD_FOLDER

const uploadResume = async (req, res) => {
  try {
    // ✅ Better error checking
    console.log('📁 Received file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Make sure the field name is "resume" and type is "File" in Postman.'
      });
    }

    
    // ✅ Check if buffer exists (memory storage)
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'File buffer is missing. Check multer configuration.',
        debug: {
          hasFile: !!req.file,
          hasBuffer: !!req.file.buffer,
          hasPath: !!req.file.path
        }
      });
    }

    const authService = new AuthService();
    const token = await authService.getAccessToken();

    const driveResponse = await axios.get(
      `${BASE_URL}/sites/${SITE_ID}/lists/${RESUME_LIBRARY_ID}/drive`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const driveId = driveResponse.data.id;

    // ✅ Use buffer from memory
    const fileContent = req.file.buffer;
    const timestamp = Date.now();
    const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    const uploadUrl = `${BASE_URL}/sites/${SITE_ID}/drives/${driveId}/root:/${UPLOAD_FOLDER}/${fileName}:/content`;

    
    const uploadResponse = await axios.put(uploadUrl, fileContent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      }
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        resumeUrl: uploadResponse.data.webUrl,
        resumeFileName: uploadResponse.data.name,
        fileId: uploadResponse.data.id
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error.response?.data || error.message);
    console.error('❌ Full error:', error);

    res.status(500).json({
      success: false,
      message: 'Error uploading file to SharePoint',
      error: error.message,
      details: error.response?.data || null
    });
  }
};

const getFileUrl = async (req, res) => {
  try {
    const { fileId } = req.params;

    const authService = new AuthService();
    const token = await authService.getAccessToken();

    const driveResponse = await axios.get(
      `${BASE_URL}/sites/${SITE_ID}/lists/${RESUME_LIBRARY_ID}/drive`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const driveId = driveResponse.data.id;

    const fileResponse = await axios.get(
      `${BASE_URL}/sites/${SITE_ID}/drives/${driveId}/items/${fileId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        webUrl: fileResponse.data.webUrl,
        downloadUrl: fileResponse.data['@microsoft.graph.downloadUrl']
      }
    });

  } catch (error) {
    console.error('Error getting file URL:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving file URL',
      error: error.message
    });
  }
};

module.exports = {
  uploadResume,
  getFileUrl
};
