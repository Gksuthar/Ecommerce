import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Category from '../models/category.js';

dotenv.config();

const categoriesToInsert = [
  {
    name: 'Fashion',
    images: [],
    parentCatName: '',
    parentId: null,
  },
  {
    name: 'Beauty',
    images: [],
    parentCatName: '',
    parentId: null,
  },
  {
    name: 'Electronics',
    images: [],
    parentCatName: '',
    parentId: null,
  },
  {
    name: 'Home & Living',
    images: [],
    parentCatName: '',
    parentId: null,
  },
];

const subcategories = {
  Fashion: [
    { name: 'Men', images: [] },
    { name: 'Women', images: [] },
    { name: 'Kids', images: [] },
  ],
  Beauty: [
    { name: 'Makeup', images: [] },
    { name: 'Skincare', images: [] },
    { name: 'Haircare', images: [] },
  ],
  Electronics: [
    { name: 'Mobiles', images: [] },
    { name: 'Laptops', images: [] },
    { name: 'Accessories', images: [] },
  ],
  'Home & Living': [
    { name: 'Furniture', images: [] },
    { name: 'Decor', images: [] },
    { name: 'Kitchen', images: [] },
  ],
};

const run = async () => {
  try {
    await connectDB();

    // Insert parent categories only if they don't already exist
    for (const cat of categoriesToInsert) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        const created = await Category.create(cat);
        console.log('Created category:', created.name);

        // insert subcategories for this created category
        const subs = subcategories[cat.name];
        if (Array.isArray(subs)) {
          for (const sub of subs) {
            const subExists = await Category.findOne({ name: sub.name, parentId: created._id });
            if (!subExists) {
              const createdSub = await Category.create({
                name: sub.name,
                images: sub.images || [],
                parentCatName: created.name,
                parentId: created._id,
              });
              console.log('  Created subcategory:', createdSub.name);
            } else {
              console.log('  Subcategory already exists:', sub.name);
            }
          }
        }
      } else {
        console.log('Category already exists:', cat.name);

        // ensure subcategories exist
        const subs = subcategories[cat.name];
        if (Array.isArray(subs)) {
          for (const sub of subs) {
            const subExists = await Category.findOne({ name: sub.name, parentId: exists._id });
            if (!subExists) {
              const createdSub = await Category.create({
                name: sub.name,
                images: sub.images || [],
                parentCatName: exists.name,
                parentId: exists._id,
              });
              console.log('  Created subcategory:', createdSub.name);
            } else {
              console.log('  Subcategory already exists:', sub.name);
            }
          }
        }
      }
    }

    console.log('Seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
};

run();
