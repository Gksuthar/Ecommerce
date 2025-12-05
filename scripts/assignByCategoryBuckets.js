import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import Product from '../models/product.js';

dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BACKEND_PORT = process.env.PORT || 2000;
const BACKEND_HOST = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

const categoryKeywords = {
  Electronics: ['phone','mobile','ipad','laptop','charger','headphone','earbud','tablet','camera','controller','iphone','apple'],
  Fashion: ['men','women','dress','shoe','shoe','shirt','pants','jeans','tshirt','sneaker','bag','clothe','fashion'],
  Beauty: ['makeup','skincare','cream','serum','lipstick','cosmetic','hair','shampoo','beauty'],
  'Home & Living': ['chair','sofa','table','kitchen','decor','lamp','furniture','bed','mattress','living'],
}

const run = async ()=>{
  try{
    await connectDB();
    const files = fs.readdirSync(UPLOAD_DIR).filter(f=>{const ext=path.extname(f).toLowerCase(); return ['.jpg','.jpeg','.png','.webp'].includes(ext)});
    if(!files.length){ console.log('No files'); process.exit(0); }

    // prepare buckets
    const buckets = {};
    for(const cat of Object.keys(categoryKeywords)) buckets[cat]=[];
    const others = [];

    for(const f of files){
      const name = f.toLowerCase();
      let matched = false;
      for(const [cat, kws] of Object.entries(categoryKeywords)){
        for(const kw of kws){ if(name.includes(kw)){ buckets[cat].push(f); matched = true; break; } }
        if(matched) break;
      }
      if(!matched) others.push(f);
    }

    // If any bucket empty, fill from others round-robin
    const cats = Object.keys(buckets);
    let idx = 0;
    while(others.length){
      const f = others.shift();
      const cat = cats[idx % cats.length];
      buckets[cat].push(f);
      idx++;
    }

    // Log bucket sizes
    for(const cat of cats){ console.log(`Bucket ${cat}: ${buckets[cat].length} files`); }

    // Now assign per-product using its catName; fallback to bucket cycling
    const products = await Product.find({}).sort({_id:1});
    const pointers = {}; cats.forEach(c=>pointers[c]=0);

    for(const p of products){
      const pc = p.catName && buckets[p.catName] ? p.catName : cats[0];
      const bucket = buckets[pc] && buckets[pc].length ? buckets[pc] : buckets[cats[0]];
      // pick 3 distinct by cycling pointer
      const imgs = [];
      for(let i=0;i<3;i++){
        const f = bucket[pointers[pc] % bucket.length];
        pointers[pc]++;
        if(!imgs.includes(f)) imgs.push(f);
      }
      p.images = imgs.map(f=>`${BACKEND_HOST}/uploads/${encodeURIComponent(f)}`);
      await p.save();
      console.log(`Assigned ${imgs.length} images to ${p.name} from bucket ${pc}: ${imgs.join(', ')}`);
    }

    console.log('Bucket-based assignment finished');
    process.exit(0);
  }catch(err){ console.error('Err',err); process.exit(1); }
}

run();
