import mongoose from 'mongoose';
import dotenv from 'dotenv';
import categoryModal from '../models/category.js';
import ProductModal from '../models/product.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const categoriesData = [
  // Main Categories (Level 1)
  {
    name: 'Electronics',
    level: 1,
    status: 'active',
    slug: 'electronics',
    parentId: null,
    parentCatName: '',
    images: ['https://res.cloudinary.com/demo/image/upload/v1234567890/electronics.jpg'],
  },
  {
    name: 'Fashion',
    level: 1,
    status: 'active',
    slug: 'fashion',
    parentId: null,
    parentCatName: '',
    images: ['https://res.cloudinary.com/demo/image/upload/v1234567890/fashion.jpg'],
  },
  {
    name: 'Home & Kitchen',
    level: 1,
    status: 'active',
    slug: 'home-kitchen',
    parentId: null,
    parentCatName: '',
    images: ['https://res.cloudinary.com/demo/image/upload/v1234567890/home.jpg'],
  },
  {
    name: 'Beauty & Personal Care',
    level: 1,
    status: 'active',
    slug: 'beauty-personal-care',
    parentId: null,
    parentCatName: '',
    images: ['https://res.cloudinary.com/demo/image/upload/v1234567890/beauty.jpg'],
  },
  {
    name: 'Sports & Fitness',
    level: 1,
    status: 'active',
    slug: 'sports-fitness',
    parentId: null,
    parentCatName: '',
    images: ['https://res.cloudinary.com/demo/image/upload/v1234567890/sports.jpg'],
  },
];

const subcategoriesData = [
  // Electronics Subcategories (Level 2)
  { name: 'Mobiles & Tablets', slug: 'mobiles-tablets', parentName: 'Electronics' },
  { name: 'Laptops & Computers', slug: 'laptops-computers', parentName: 'Electronics' },
  { name: 'TVs & Appliances', slug: 'tvs-appliances', parentName: 'Electronics' },
  { name: 'Cameras & Photography', slug: 'cameras-photography', parentName: 'Electronics' },
  
  // Fashion Subcategories (Level 2)
  { name: "Men's Fashion", slug: 'mens-fashion', parentName: 'Fashion' },
  { name: "Women's Fashion", slug: 'womens-fashion', parentName: 'Fashion' },
  { name: 'Kids Fashion', slug: 'kids-fashion', parentName: 'Fashion' },
  { name: 'Footwear', slug: 'footwear', parentName: 'Fashion' },
  
  // Home & Kitchen Subcategories (Level 2)
  { name: 'Furniture', slug: 'furniture', parentName: 'Home & Kitchen' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', parentName: 'Home & Kitchen' },
  { name: 'Home Decor', slug: 'home-decor', parentName: 'Home & Kitchen' },
  
  // Beauty Subcategories (Level 2)
  { name: 'Makeup', slug: 'makeup', parentName: 'Beauty & Personal Care' },
  { name: 'Skincare', slug: 'skincare', parentName: 'Beauty & Personal Care' },
  { name: 'Haircare', slug: 'haircare', parentName: 'Beauty & Personal Care' },
  
  // Sports Subcategories (Level 2)
  { name: 'Gym Equipment', slug: 'gym-equipment', parentName: 'Sports & Fitness' },
  { name: 'Sports Wear', slug: 'sports-wear', parentName: 'Sports & Fitness' },
  { name: 'Outdoor Sports', slug: 'outdoor-sports', parentName: 'Sports & Fitness' },
];

const thirdLevelCategories = [
  // Mobiles & Tablets -> Third Level (Level 3)
  { name: 'Smartphones', slug: 'smartphones', parentName: 'Mobiles & Tablets' },
  { name: 'Feature Phones', slug: 'feature-phones', parentName: 'Mobiles & Tablets' },
  { name: 'Tablets', slug: 'tablets', parentName: 'Mobiles & Tablets' },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', parentName: 'Mobiles & Tablets' },
  
  // Laptops & Computers -> Third Level
  { name: 'Gaming Laptops', slug: 'gaming-laptops', parentName: 'Laptops & Computers' },
  { name: 'Business Laptops', slug: 'business-laptops', parentName: 'Laptops & Computers' },
  { name: 'Desktop PCs', slug: 'desktop-pcs', parentName: 'Laptops & Computers' },
  { name: 'Computer Accessories', slug: 'computer-accessories', parentName: 'Laptops & Computers' },
  
  // Men's Fashion -> Third Level
  { name: 'Shirts', slug: 'mens-shirts', parentName: "Men's Fashion" },
  { name: 'T-Shirts', slug: 'mens-tshirts', parentName: "Men's Fashion" },
  { name: 'Jeans', slug: 'mens-jeans', parentName: "Men's Fashion" },
  { name: 'Formal Wear', slug: 'mens-formal-wear', parentName: "Men's Fashion" },
  
  // Women's Fashion -> Third Level
  { name: 'Sarees', slug: 'sarees', parentName: "Women's Fashion" },
  { name: 'Kurtis', slug: 'kurtis', parentName: "Women's Fashion" },
  { name: 'Dresses', slug: 'dresses', parentName: "Women's Fashion" },
  { name: 'Western Wear', slug: 'western-wear', parentName: "Women's Fashion" },
  
  // Makeup -> Third Level
  { name: 'Lipsticks', slug: 'lipsticks', parentName: 'Makeup' },
  { name: 'Foundation', slug: 'foundation', parentName: 'Makeup' },
  { name: 'Eye Makeup', slug: 'eye-makeup', parentName: 'Makeup' },
  { name: 'Nail Polish', slug: 'nail-polish', parentName: 'Makeup' },
  
  // Furniture -> Third Level
  { name: 'Beds', slug: 'beds', parentName: 'Furniture' },
  { name: 'Sofas', slug: 'sofas', parentName: 'Furniture' },
  { name: 'Dining Tables', slug: 'dining-tables', parentName: 'Furniture' },
  { name: 'Wardrobes', slug: 'wardrobes', parentName: 'Furniture' },
];

const productsData = [
  // Electronics Products
  {
    name: 'iPhone 15 Pro Max',
    description: '6.7-inch Super Retina XDR display, A17 Pro chip, Pro camera system',
    brand: 'Apple',
    price: 134900,
    oldPrice: 144900,
    discount: 7,
    countInStock: 50,
    isFeatured: true,
    catName: 'Electronics',
    subCat: 'Mobiles & Tablets',
    thirdSubCat: 'Smartphones',
    rating: 4.8,
    images: [
      'https://m.media-amazon.com/images/I/81SigpJN1KL._SX569_.jpg',
      'https://m.media-amazon.com/images/I/81fO4TOon1L._SX569_.jpg'
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: '6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3, 200MP camera',
    brand: 'Samsung',
    price: 124999,
    oldPrice: 134999,
    discount: 7,
    countInStock: 45,
    isFeatured: true,
    catName: 'Electronics',
    subCat: 'Mobiles & Tablets',
    thirdSubCat: 'Smartphones',
    rating: 4.7,
    images: [
      'https://m.media-amazon.com/images/I/71p5VqW4tVL._SX569_.jpg',
      'https://m.media-amazon.com/images/I/71xqLqfiLLL._SX569_.jpg'
    ]
  },
  {
    name: 'OnePlus 12',
    description: '6.82-inch AMOLED display, Snapdragon 8 Gen 3, 50MP triple camera',
    brand: 'OnePlus',
    price: 64999,
    oldPrice: 69999,
    discount: 7,
    countInStock: 100,
    isFeatured: false,
    catName: 'Electronics',
    subCat: 'Mobiles & Tablets',
    thirdSubCat: 'Smartphones',
    rating: 4.6,
    images: [
      'https://m.media-amazon.com/images/I/71fPIta2J7L._SX569_.jpg'
    ]
  },
  {
    name: 'Dell XPS 15 Gaming Laptop',
    description: 'Intel Core i9, NVIDIA RTX 4070, 32GB RAM, 1TB SSD',
    brand: 'Dell',
    price: 189999,
    oldPrice: 209999,
    discount: 10,
    countInStock: 20,
    isFeatured: true,
    catName: 'Electronics',
    subCat: 'Laptops & Computers',
    thirdSubCat: 'Gaming Laptops',
    rating: 4.7,
    images: [
      'https://m.media-amazon.com/images/I/61ug0cBd99L._SX569_.jpg'
    ]
  },
  {
    name: 'MacBook Pro 16-inch M3 Pro',
    description: 'Apple M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR',
    brand: 'Apple',
    price: 249900,
    oldPrice: 269900,
    discount: 7,
    countInStock: 15,
    isFeatured: true,
    catName: 'Electronics',
    subCat: 'Laptops & Computers',
    thirdSubCat: 'Business Laptops',
    rating: 4.9,
    images: [
      'https://m.media-amazon.com/images/I/61L5QxAr6PL._SX569_.jpg'
    ]
  },
  
  // Fashion Products
  {
    name: 'Levi\'s Men\'s Slim Fit Jeans',
    description: 'Classic 5-pocket styling, Slim fit, Comfortable stretch denim',
    brand: "Levi's",
    price: 2499,
    oldPrice: 3499,
    discount: 29,
    countInStock: 200,
    isFeatured: false,
    catName: 'Fashion',
    subCat: "Men's Fashion",
    thirdSubCat: 'Jeans',
    rating: 4.3,
    size: ['30', '32', '34', '36'],
    images: [
      'https://m.media-amazon.com/images/I/71tkmAk4pkL._SY695_.jpg'
    ]
  },
  {
    name: 'Arrow Men\'s Formal Shirt',
    description: 'Regular fit, Cotton blend, Perfect for office wear',
    brand: 'Arrow',
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    countInStock: 150,
    isFeatured: false,
    catName: 'Fashion',
    subCat: "Men's Fashion",
    thirdSubCat: 'Shirts',
    rating: 4.2,
    size: ['38', '40', '42', '44'],
    images: [
      'https://m.media-amazon.com/images/I/71IZlq8DKOL._SY741_.jpg'
    ]
  },
  {
    name: 'Nike Men\'s Sports T-Shirt',
    description: 'Dri-FIT technology, Lightweight and breathable',
    brand: 'Nike',
    price: 1299,
    oldPrice: 1795,
    discount: 28,
    countInStock: 180,
    isFeatured: true,
    catName: 'Fashion',
    subCat: "Men's Fashion",
    thirdSubCat: 'T-Shirts',
    rating: 4.5,
    size: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://m.media-amazon.com/images/I/61yvRi9SksL._SY741_.jpg'
    ]
  },
  {
    name: 'Aurelia Women\'s Kurti',
    description: 'Pure cotton, Floral print, Comfortable fit',
    brand: 'Aurelia',
    price: 899,
    oldPrice: 1499,
    discount: 40,
    countInStock: 120,
    isFeatured: false,
    catName: 'Fashion',
    subCat: "Women's Fashion",
    thirdSubCat: 'Kurtis',
    rating: 4.4,
    size: ['S', 'M', 'L', 'XL'],
    images: [
      'https://m.media-amazon.com/images/I/81cygQkx1PL._SY741_.jpg'
    ]
  },
  {
    name: 'Banarasi Silk Saree',
    description: 'Traditional Banarasi silk, Golden zari work, With blouse piece',
    brand: 'Craftsvilla',
    price: 2999,
    oldPrice: 5999,
    discount: 50,
    countInStock: 50,
    isFeatured: true,
    catName: 'Fashion',
    subCat: "Women's Fashion",
    thirdSubCat: 'Sarees',
    rating: 4.6,
    images: [
      'https://m.media-amazon.com/images/I/91KJPzjuz9L._SY741_.jpg'
    ]
  },
  
  // Beauty Products
  {
    name: 'Maybelline SuperStay Matte Ink Lipstick',
    description: 'Long-lasting formula, 16-hour wear, Comfortable matte finish',
    brand: 'Maybelline',
    price: 599,
    oldPrice: 699,
    discount: 14,
    countInStock: 300,
    isFeatured: true,
    catName: 'Beauty & Personal Care',
    subCat: 'Makeup',
    thirdSubCat: 'Lipsticks',
    rating: 4.5,
    images: [
      'https://m.media-amazon.com/images/I/41fN7CWRDEL._SX300_SY300_QL70_FMwebp_.jpg'
    ]
  },
  {
    name: 'Lakme 9to5 Primer + Matte Foundation',
    description: 'Waterproof, SPF 20, Natural matte finish',
    brand: 'Lakme',
    price: 425,
    oldPrice: 475,
    discount: 11,
    countInStock: 250,
    isFeatured: false,
    catName: 'Beauty & Personal Care',
    subCat: 'Makeup',
    thirdSubCat: 'Foundation',
    rating: 4.3,
    images: [
      'https://m.media-amazon.com/images/I/41r4qy8ggqL._SX300_SY300_QL70_FMwebp_.jpg'
    ]
  },
  {
    name: 'Plum Green Tea Face Wash',
    description: 'Oil control, Deep cleansing, For oily skin',
    brand: 'Plum',
    price: 349,
    oldPrice: 425,
    discount: 18,
    countInStock: 200,
    isFeatured: false,
    catName: 'Beauty & Personal Care',
    subCat: 'Skincare',
    thirdSubCat: 'Face Wash',
    rating: 4.4,
    images: [
      'https://m.media-amazon.com/images/I/41kC0zPakmL._SX300_SY300_QL70_FMwebp_.jpg'
    ]
  },
  
  // Home & Kitchen Products
  {
    name: 'Urban Ladder Sofa 3 Seater',
    description: 'Fabric upholstery, Sturdy wooden frame, Modern design',
    brand: 'Urban Ladder',
    price: 24999,
    oldPrice: 34999,
    discount: 29,
    countInStock: 15,
    isFeatured: true,
    catName: 'Home & Kitchen',
    subCat: 'Furniture',
    thirdSubCat: 'Sofas',
    rating: 4.5,
    images: [
      'https://m.media-amazon.com/images/I/71VQYZqLVNL._SX569_.jpg'
    ]
  },
  {
    name: 'Godrej Interio Queen Size Bed',
    description: 'Engineered wood, Storage included, Contemporary design',
    brand: 'Godrej Interio',
    price: 18999,
    oldPrice: 25999,
    discount: 27,
    countInStock: 20,
    isFeatured: false,
    catName: 'Home & Kitchen',
    subCat: 'Furniture',
    thirdSubCat: 'Beds',
    rating: 4.3,
    images: [
      'https://m.media-amazon.com/images/I/81G8Qr4XqEL._SX569_.jpg'
    ]
  },
  {
    name: 'Prestige Induction Cooktop',
    description: '2000W power, Automatic voltage regulator, Safety features',
    brand: 'Prestige',
    price: 2299,
    oldPrice: 3495,
    discount: 34,
    countInStock: 80,
    isFeatured: false,
    catName: 'Home & Kitchen',
    subCat: 'Kitchen & Dining',
    thirdSubCat: 'Cooktops',
    rating: 4.4,
    images: [
      'https://m.media-amazon.com/images/I/61dJtBVFMnL._SX569_.jpg'
    ]
  },
  
  // Sports Products
  {
    name: 'Boldfit Gym Dumbbell Set',
    description: 'Non-slip grip, Rust-free coating, 20kg set',
    brand: 'Boldfit',
    price: 1999,
    oldPrice: 3999,
    discount: 50,
    countInStock: 60,
    isFeatured: true,
    catName: 'Sports & Fitness',
    subCat: 'Gym Equipment',
    thirdSubCat: 'Free Weights',
    productWeight: ['5kg', '10kg', '15kg', '20kg'],
    rating: 4.5,
    images: [
      'https://m.media-amazon.com/images/I/61R0j6ELe0L._SX569_.jpg'
    ]
  },
  {
    name: 'Nike Men\'s Running Shoes',
    description: 'Lightweight mesh, Air cushioning, Excellent grip',
    brand: 'Nike',
    price: 3995,
    oldPrice: 5995,
    discount: 33,
    countInStock: 90,
    isFeatured: true,
    catName: 'Sports & Fitness',
    subCat: 'Sports Wear',
    thirdSubCat: 'Sports Shoes',
    size: ['7', '8', '9', '10', '11'],
    rating: 4.6,
    images: [
      'https://m.media-amazon.com/images/I/71HnhY7TP2L._SX695_.jpg'
    ]
  },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Clear existing data
    console.log('🗑️  Clearing existing categories and products...');
    await categoryModal.deleteMany({});
    await ProductModal.deleteMany({});
    console.log('✅ Cleared successfully\n');
    
    // Insert main categories (Level 1)
    console.log('📦 Inserting main categories (Level 1)...');
    const insertedMainCategories = await categoryModal.insertMany(categoriesData);
    console.log(`✅ Inserted ${insertedMainCategories.length} main categories\n`);
    
    // Create a map for easy lookup
    const categoryMap = {};
    insertedMainCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Insert subcategories (Level 2)
    console.log('📦 Inserting subcategories (Level 2)...');
    const subcategoriesWithParents = subcategoriesData.map(subCat => {
      const parentId = categoryMap[subCat.parentName];
      return {
        name: subCat.name,
        slug: subCat.slug,
        level: 2,
        status: 'active',
        parentId: parentId,
        parentCatName: subCat.parentName,
        images: []
      };
    });
    const insertedSubCategories = await categoryModal.insertMany(subcategoriesWithParents);
    console.log(`✅ Inserted ${insertedSubCategories.length} subcategories\n`);
    
    // Update map with subcategories
    insertedSubCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Insert third level categories (Level 3)
    console.log('📦 Inserting third level categories (Level 3)...');
    const thirdLevelWithParents = thirdLevelCategories.map(thirdCat => {
      const parentId = categoryMap[thirdCat.parentName];
      return {
        name: thirdCat.name,
        slug: thirdCat.slug,
        level: 3,
        status: 'active',
        parentId: parentId,
        parentCatName: thirdCat.parentName,
        images: []
      };
    });
    const insertedThirdLevel = await categoryModal.insertMany(thirdLevelWithParents);
    console.log(`✅ Inserted ${insertedThirdLevel.length} third level categories\n`);
    
    // Update map with third level categories
    insertedThirdLevel.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Insert products
    console.log('🛍️  Inserting products...');
    const productsWithCategoryIds = productsData.map(product => {
      const catId = categoryMap[product.catName];
      const subCatId = categoryMap[product.subCat];
      const thirdSubCatId = categoryMap[product.thirdSubCat];
      
      return {
        ...product,
        catId: catId ? catId.toString() : '',
        subCatId: subCatId ? subCatId.toString() : '',
        thirdSubCatId: thirdSubCatId ? thirdSubCatId.toString() : '',
        category: catId,
      };
    });
    
    const insertedProducts = await ProductModal.insertMany(productsWithCategoryIds);
    console.log(`✅ Inserted ${insertedProducts.length} products\n`);
    
    // Print summary
    console.log('📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Main Categories (Level 1): ${insertedMainCategories.length}`);
    console.log(`✅ Subcategories (Level 2): ${insertedSubCategories.length}`);
    console.log(`✅ Third Level Categories (Level 3): ${insertedThirdLevel.length}`);
    console.log(`✅ Products: ${insertedProducts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 Database seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
connectDB().then(() => {
  seedDatabase();
});
