import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import Product from '../models/product.js';

dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BACKEND_PORT = process.env.PORT || 2000;
const BACKEND_HOST = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

const generalKeywords = {
  Electronics: ['phone', 'mobile', 'ipad', 'laptop', 'charger', 'earbud', 'headphone', 'tablet', 'camera', 'controller'],
  Fashion: ['men', 'women', 'dress', 'shirt', 'shoe', 'jeans', 'pants', 'sneaker', 'tshirt', 'jacket', 'kids'],
  Beauty: ['makeup', 'skincare', 'cream', 'serum', 'lipstick', 'cosmetic', 'hair', 'shampoo', 'conditioner'],
  'Home & Living': ['chair', 'sofa', 'table', 'kitchen', 'decor', 'lamp', 'furniture', 'bed', 'mattress'],
  Watches: ['watch'],
  Accessories: ['bag', 'purse', 'belt', 'wallet'],
};

function tokenize(s){
  if(!s) return [];
  return s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
}

function fileMatchesKeywords(filename, keywords){
  const n = filename.toLowerCase();
  for(const k of keywords){
    if(n.includes(k)) return true;
  }
  return false;
}

const run = async ()=>{
  try{
    await connectDB();
    const files = fs.readdirSync(UPLOAD_DIR).filter(f=>{const ext=path.extname(f).toLowerCase(); return ['.jpg','.jpeg','.png','.webp'].includes(ext)});
    if(!files.length){
      console.log('No upload images found');
      process.exit(0);
    }
    // Preprocess filenames -> base name
    const fileBases = files.map(f=>({file:f,base: path.basename(f).toLowerCase()}));

    const products = await Product.find({}).sort({_id:1});
    console.log(`Found ${products.length} products, ${files.length} upload files.`);

    for(const prod of products){
      const keywords = [];
      keywords.push(...tokenize(prod.name));
      keywords.push(...tokenize(prod.brand));
      keywords.push(...tokenize(prod.catName));
      keywords.push(...tokenize(prod.subCat));
      keywords.push(...tokenize(prod.thirdSubCat));
      // add general keywords based on catName if present
      if(prod.catName && generalKeywords[prod.catName]){
        keywords.push(...generalKeywords[prod.catName]);
      } else {
        // try to map broader categories
        for(const k in generalKeywords){
          if(prod.catName && prod.catName.toLowerCase().includes(k.toLowerCase())){
            keywords.push(...generalKeywords[k]);
          }
        }
      }

      // unique keywords preserve order
      const uniqKeywords = Array.from(new Set(keywords.filter(Boolean)));

      // find files matching most keywords first
      const scored = fileBases.map(fb=>{
        let score = 0;
        for(const kw of uniqKeywords){ if(fb.base.includes(kw)) score+=1; }
        return {...fb,score};
      }).sort((a,b)=>b.score - a.score);

      // pick top 3 with score>0; if none have score>0, fallback to category-general keywords match
      let selected = scored.filter(s=>s.score>0).slice(0,3).map(s=>s.file);
      if(selected.length < 3){
        // try general keywords matching
        const genKeys = (prod.catName && generalKeywords[prod.catName]) || [].concat(...Object.values(generalKeywords));
        const genMatches = fileBases.filter(fb=>fileMatchesKeywords(fb.base, genKeys)).map(fb=>fb.file);
        for(const f of genMatches){ if(!selected.includes(f)) selected.push(f); if(selected.length>=3) break; }
      }

      if(selected.length < 3){
        // last fallback: pick random distinct files
        const pool = fileBases.map(fb=>fb.file).filter(f=>!selected.includes(f));
        while(selected.length<3 && pool.length){
          const pick = pool.shift();
          selected.push(pick);
        }
      }

      // ensure exactly 3
      selected = selected.slice(0,3);

      const images = selected.map(f=>`${BACKEND_HOST}/uploads/${encodeURIComponent(f)}`);
      prod.images = images;
      await prod.save();
      console.log(`Assigned ${images.length} images to product: ${prod.name} -> ${images.map(i=>i.split('/').pop()).join(', ')}`);
    }

    console.log('Keyword-based mapping finished');
    process.exit(0);
  }catch(err){
    console.error('Error mapping images:', err);
    process.exit(1);
  }
}

run();
