#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
// Try to load backend .env explicitly (script may be run from workspace root)
const envPath = path.resolve(process.cwd(), 'backend', '.env');
dotenv.config({ path: envPath });
import connectDB from '../config/db.js';
import Category from '../models/category.js';

const FRONTEND_HOST = process.env.FRONTEND_HOST || 'http://localhost:5173';

function getFallbackImage(name) {
  if (!name) return `${FRONTEND_HOST}/images/fashion.svg`;
  const key = name.toLowerCase();
  if (key.includes('elect') || key.includes('phone') || key.includes('mobile')) return `${FRONTEND_HOST}/images/electronics.svg`;
  if (key.includes('fashion') || key.includes('clothe') || key.includes('men') || key.includes('women')) return `${FRONTEND_HOST}/images/fashion.svg`;
  if (key.includes('watch')) return `${FRONTEND_HOST}/images/watch.svg`;
  if (key.includes('chair') || key.includes('furniture')) return `${FRONTEND_HOST}/images/chair.svg`;
  if (key.includes('shoe')) return `${FRONTEND_HOST}/images/shoes.svg`;
  if (key.includes('purse') || key.includes('bag')) return `${FRONTEND_HOST}/images/purse.svg`;
  if (key.includes('controller') || key.includes('game')) return `${FRONTEND_HOST}/images/controller.svg`;
  return `${FRONTEND_HOST}/images/fashion.svg`;
}

async function main(){
  await connectDB();
  try{
    const categories = await Category.find();
    let updated = 0;
    for(const cat of categories){
      if(!cat.images || cat.images.length === 0){
        const url = getFallbackImage(cat.name || '');
        cat.images = [url];
        await cat.save();
        updated++;
        console.log(`Updated category ${cat.name} -> ${url}`);
      }
    }
    console.log(`Done. Updated ${updated} categories.`);
  }catch(err){
    console.error('Error:', err);
  }finally{
    process.exit(0);
  }
}

main();
