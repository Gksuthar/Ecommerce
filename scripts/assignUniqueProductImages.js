import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import Product from '../models/product.js';

dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BACKEND_PORT = process.env.PORT || 2000;
const BACKEND_HOST = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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

    const products = await Product.find({}).sort({_id: 1});
    console.log(`Found ${products.length} products; ${files.length} upload images available.`);

    // Create a large pool by repeating shuffled files until we have >= products.length * 3
    const needed = products.length * 3;
    let pool = [];
    let round = 0;
    while (pool.length < needed) {
      round++;
      pool = pool.concat(shuffle([...files]));
      if (round > 20) break; // safety
    }

    // Assign 3 consecutive images from the pool to each product
    for (let i = 0; i < products.length; i++) {
      const start = i * 3;
      const candidate = pool.slice(start, start + 3);
      // ensure unique within the product
      const unique = Array.from(new Set(candidate));
      // if uniqueness fell short (due to small files), fill with next distinct files
      let idx = start + 3;
      while (unique.length < 3) {
        const nextFile = pool[idx % pool.length];
        if (!unique.includes(nextFile)) unique.push(nextFile);
        idx++;
      }

      const images = unique.map(f => `${BACKEND_HOST}/uploads/${encodeURIComponent(f)}`);
      products[i].images = images;
      await products[i].save();
      console.log(`Updated product images for: ${products[i].name}`);
    }

    console.log('Unique image assignment finished');
    process.exit(0);
  } catch (err) {
    console.error('Error assigning unique images to products:', err);
    process.exit(1);
  }
};

run();
