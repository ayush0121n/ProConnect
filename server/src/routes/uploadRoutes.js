const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { uploadImage, upload, uploadResume } = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Upload image
router.post('/image', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided' });
    let result;
    try {
      result = await uploadToCloudinary(req.file.path, 'proconnect/images');
    } catch (e) {
      // Fallback: return local path if Cloudinary not configured
      result = { url: `/uploads/${req.file.filename}`, publicId: req.file.filename };
    }
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// Upload document
router.post('/document', protect, uploadResume.single('document'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No document provided' });
    let result;
    try {
      result = await uploadToCloudinary(req.file.path, 'proconnect/documents', { resource_type: 'raw' });
    } catch (e) {
      result = { url: `/uploads/${req.file.filename}`, publicId: req.file.filename };
    }
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// Delete uploaded file
router.delete('/:publicId', protect, async (req, res, next) => {
  try {
    await deleteFromCloudinary(req.params.publicId);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
