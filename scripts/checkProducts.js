import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModal from '../models/product.js';

dotenv.config();

const checkProducts = async () => {
  try {
    const uri = process.env.MONGO_DB || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const products = await ProductModal.find({}).limit(5);
    
    console.log('\n📦 Sample Products from DB:');
    console.log('Total products:', await ProductModal.countDocuments());
    console.log('\nFirst 5 products:');
    
    products.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   catName: "${p.catName}"`);
      console.log(`   subCat: "${p.subCat}"`);
      console.log(`   thirdSubCat: "${p.thirdSubCat}"`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkProducts();
