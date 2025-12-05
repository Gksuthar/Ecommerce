import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Category from '../models/category.js';
import Product from '../models/product.js';

dotenv.config();

// simple image mapping per parent category name -> frontend public images
const imageMap = {
  Fashion: ['/images/fashion.svg', '/images/shoes.svg'],
  Beauty: ['/images/purse.svg', '/images/purse.svg'],
  Electronics: ['/images/electronics.svg', '/images/controller.svg'],
  'Home & Living': ['/images/chair.svg', '/images/chair.svg'],
};

const run = async () => {
  try {
    await connectDB();

    const parents = await Category.find({ parentId: null });
    for (const parent of parents) {
      const subs = await Category.find({ parentId: parent._id });
      for (const sub of subs) {
        // create one third-level under each subcategory if not exists
        let third = await Category.findOne({ parentId: sub._id });
        if (!third) {
          const thirdName = `${sub.name} - General`;
          third = await Category.create({
            name: thirdName,
            images: [],
            parentCatName: sub.name,
            parentId: sub._id,
          });
          console.log('Created third-level category:', third.name);
        } else {
          console.log('Third-level already exists for', sub.name, '->', third.name);
        }

        // Seed some sample products for this combination (2 products)
        const imagesForParent = imageMap[parent.name] || ['/images/fashion.svg'];
        for (let i = 1; i <= 2; i++) {
          const productName = `${parent.name} ${sub.name} Product ${i}`;
          const exists = await Product.findOne({ name: productName, thirdSubCatId: third._id });
          if (exists) {
            console.log('Product already exists:', productName);
            continue;
          }

          const price = Math.floor(Math.random() * 20000) + 999;
          const newP = await Product.create({
            name: productName,
            description: `Sample product ${i} for ${sub.name} under ${parent.name}`,
            images: [imagesForParent[0], imagesForParent[1] || imagesForParent[0]],
            brand: parent.name,
            price: price,
            oldPrice: price + 1500,
            catName: parent.name,
            catId: parent._id,
            subCat: sub.name,
            subCatId: sub._id,
            thirdSubCat: third.name,
            thirdSubCatId: third._id,
            category: parent._id,
            countInStock: 50,
            rating: 4,
            discount: 10,
          });
          console.log('Created product:', newP.name);
        }
      }
    }

    console.log('Product seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
};

run();
