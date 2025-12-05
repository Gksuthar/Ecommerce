import express from 'express';
import Blog from '../models/blog.js';
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

// GET /api/blog/  -> list all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: blogs });
  } catch (err) {
    console.error('Blog list error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/blog/:id -> single blog (by ID or slug)
router.get('/:id', async (req, res) => {
  try {
    let blog;
    // Check if it's a valid MongoDB ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(req.params.id);
    } else {
      // Otherwise, search by slug
      blog = await Blog.findOne({ slug: req.params.id });
    }
    
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    return res.status(200).json({ success: true, data: blog });
  } catch (err) {
    console.error('Blog fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/blog -> create new blog
router.post('/', upload.single('catImg'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    let imageUrl = '';
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'blogs',
          resource_type: 'auto',
          timeout: 60000
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
      }
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now();

    const blog = new Blog({
      title,
      description,
      category: category || 'General',
      catImg: imageUrl,
      slug
    });

    await blog.save();
    return res.status(201).json({ success: true, data: blog, message: 'Blog created successfully' });
  } catch (err) {
    console.error('Blog creation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/blog/:id -> update blog
router.put('/:id', upload.single('catImg'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (category !== undefined) blog.category = category;

    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'blogs',
          resource_type: 'auto',
          timeout: 60000
        });
        blog.catImg = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
      }
    }

    if (title) {
      blog.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    await blog.save();
    return res.status(200).json({ success: true, data: blog, message: 'Blog updated successfully' });
  } catch (err) {
    console.error('Blog update error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/blog/:id -> delete blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Blog deletion error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
