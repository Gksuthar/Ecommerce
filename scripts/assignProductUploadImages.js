import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import Product from '../models/product.js';

dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BACKEND_PORT = process.env.PORT || 2000;
const BACKEND_HOST = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

const run = async () => {
  try {
    await connectDB();

    const files = fs.readdirSync(UPLOAD_DIR).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (!files.length) {
      console.log('No image files found in uploads folder.');
      process.exit(0);
    }

    const products = await Product.find({});
    console.log(`Found ${products.length} products; ${files.length} upload images available.`);

    // Round-robin assign 3 images per product from uploads
    let fileIndex = 0;
    for (const product of products) {
      const images = [];
      for (let i = 0; i < 3; i++) {
        const file = files[fileIndex % files.length];
        images.push(`${BACKEND_HOST}/uploads/${encodeURIComponent(file)}`);
        fileIndex++;
      }
      product.images = images;
      await product.save();
      console.log('Updated product images for:', product.name);
    }

    console.log('All products updated with 3 images each.');
    process.exit(0);
  } catch (err) {
    console.error('Error assigning images to products:', err);
    process.exit(1);
  }
};

run();
