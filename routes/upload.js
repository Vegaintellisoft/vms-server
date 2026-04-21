
// router.post('/upload', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
//   }
//   res.json({ filename: req.file.filename });
// });

const express = require('express');
const router = express.Router();
const upload = require('../utils/upload'); // multer middleware
const sharp = require('sharp');
const path = require('path');

router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }

  try {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = uniqueSuffix + ext;

    // Define output path
    const outputPath = path.join(__dirname, '../src/assets/images', filename);

    // Resize and compress image with sharp
    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .toFormat('jpeg', { quality: 80 })
      .toFile(outputPath);

    // Return filename in response
    res.json({ filename });

  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router;

