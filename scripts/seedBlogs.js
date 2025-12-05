import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import Blog from '../models/blog.js';

dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BACKEND_PORT = process.env.PORT || 2000;
const BACKEND_HOST = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

const sampleBlogs = [
  { title: 'Top 10 Fashion Trends in 2025', slug: 'fashion-trends-2025', category: 'Fashion' },
  { title: 'How to Choose a Laptop in 2025', slug: 'choose-laptop-2025', category: 'Electronics' },
  { title: 'Skincare Routine for Busy People', slug: 'skincare-routine', category: 'Beauty' },
  { title: 'Decor Ideas for Small Apartments', slug: 'decor-small-apartments', category: 'Home & Living' },
  { title: 'Best Headphones for Work from Home', slug: 'best-headphones-wfh', category: 'Electronics' },
  { title: 'Shoe Care Tips That Actually Work', slug: 'shoe-care-tips', category: 'Fashion' },
];

const run = async () => {
  try {
    await connectDB();
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => { const ext = path.extname(f).toLowerCase(); return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) });
    if (!files.length) { console.log('No uploads found'); process.exit(0); }

    // group by simple keyword categories similar to earlier script
    const buckets = { Electronics: [], Fashion: [], Beauty: [], 'Home & Living': [] };
    const others = [];

    for (const f of files) {
      const name = f.toLowerCase();
      let matched = false;
      if (/(phone|mobile|ipad|laptop|headphone|charger|controller|earbud|camera)/.test(name)) { buckets.Electronics.push(f); matched = true }
      if (!matched && /(shoe|dress|shirt|bag|fashion|men|women|kids|sneaker)/.test(name)) { buckets.Fashion.push(f); matched = true }
      if (!matched && /(makeup|skincare|cream|serum|hair|shampoo)/.test(name)) { buckets.Beauty.push(f); matched = true }
      if (!matched && /(chair|sofa|table|decor|kitchen|lamp|furniture|bed)/.test(name)) { buckets['Home & Living'].push(f); matched = true }
      if (!matched) others.push(f);
    }

    // distribute others round-robin
    const cats = Object.keys(buckets);
    let idx = 0;
    while (others.length) { const f = others.shift(); buckets[cats[idx % cats.length]].push(f); idx++; }

    // create blog posts
    for (const b of sampleBlogs) {
      const exists = await Blog.findOne({ slug: b.slug });
      if (exists) {
        console.log('Blog exists:', b.slug);
        continue;
      }
      const pool = buckets[b.category] && buckets[b.category].length ? buckets[b.category] : files;
      // pick up to 3 images
      const imgs = [];
      for (let i = 0; i < 3 && i < pool.length; i++) imgs.push(`${BACKEND_HOST}/uploads/${encodeURIComponent(pool[i])}`);

      const content = `Sample content for ${b.title}. Replace with actual blog content.`;
      const created = await Blog.create({ title: b.title, slug: b.slug, content, images: imgs, category: b.category });
      console.log('Created blog:', created.slug, 'images:', imgs.map(u => u.split('/').pop()).join(', '));
    }

    console.log('Blog seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding blogs:', err);
    process.exit(1);
  }
}

run();
