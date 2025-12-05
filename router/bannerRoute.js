import express from 'express';
import Banner from '../models/banner.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET /api/banners - Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: banners });
  } catch (err) {
    console.error('Banner fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/banners/active - Get only active banners
router.get('/active', async (req, res) => {
  try {
    const banners = await Banner.find({ status: 'active' }).sort({ order: 1 });
    return res.status(200).json({ success: true, data: banners });
  } catch (err) {
    console.error('Banner fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/banners - Create banner
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, link, status, order } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    let imageUrl = '';
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'banners',
        resource_type: 'auto',
        timeout: 60000
      });
      imageUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    const banner = new Banner({
      title,
      image: imageUrl,
      link: link || '',
      status: status || 'active',
      order: order || 0
    });

    await banner.save();
    return res.status(201).json({ success: true, data: banner, message: 'Banner created successfully' });
  } catch (err) {
    console.error('Banner creation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/banners/:id - Update banner
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, link, status, order } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (title) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (status) banner.status = status;
    if (order !== undefined) banner.order = parseInt(order);

    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'banners',
          resource_type: 'auto',
          timeout: 60000
        });
        banner.image = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    await banner.save();
    return res.status(200).json({ success: true, data: banner, message: 'Banner updated successfully' });
  } catch (err) {
    console.error('Banner update error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/banners/:id - Delete banner
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    return res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Banner deletion error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
