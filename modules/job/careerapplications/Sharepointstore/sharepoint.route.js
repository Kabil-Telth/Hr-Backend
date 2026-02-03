const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharepointController = require('./sharepoint.controller');

// ✅ CRITICAL: Use memoryStorage, NOT diskStorage!
const upload = multer({ 
  storage: multer.memoryStorage(),  // ← This line is critical!
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Debug middleware
router.post('/upload-resume', (req, res, next) => {
  console.log('📤 Content-Type:', req.headers['content-type']);
  console.log('📤 Has file?', !!req.file);
  next();
}, upload.single('resume'), sharepointController.uploadResume);

router.get('/file-url/:fileId', sharepointController.getFileUrl);

module.exports = router;