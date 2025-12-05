import categoyModal from "../models/category.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });



var images = [];
const imageUploader = async (req, res) => {
  try {
    const userId = req.userId;
    // images = [];
    const image = req.files;



    if (!image || image.length === 0) {
      return res
        .status(400)
        .json({ message: "No files uploaded", success: false });
    }
    
    const options = {
        use_filename: true,
        uniquee_filename:false,
        overwrite: false
    }

    for (let i = 0; i < image.length; i++) {
        const img =await cloudinary.uploader.upload(image[i].path,options)
        images.push(img.secure_url)
        fs.unlinkSync(image[i].path)
    }
      // return full array of uploaded image URLs
      return res.status(200).json({ images });

    
} catch (error) {
      return res
        .status(400)
        .json({ message: error.message || error, success: false,error : true });

  }
};
const createCategoryController = async (req, res) => {
  try {
    const {name,parentCatName,parentId, status} = req.body;
    // Allow clients to provide an images array in the request body (preferred),
    // otherwise fall back to any images previously uploaded via the imageUploader
    let providedImages = [];
    try {
      if (req.body.images) {
        // body may contain a JSON string or an actual array
        providedImages = Array.isArray(req.body.images)
          ? req.body.images
          : JSON.parse(req.body.images);
      }
    } catch (e) {
      // if parsing fails, ignore and use empty array
      providedImages = [];
    }

    const imagesToUse = providedImages.length > 0 ? providedImages : images;

    // Auto-calculate level based on parent
    let level = 1; // Default main category
    if (parentId) {
      const parentCategory = await categoyModal.findById(parentId);
      if (parentCategory) {
        level = (parentCategory.level || 1) + 1;
      }
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let category = new categoyModal({
      name,
      parentCatName,
      parentId,
      images: imagesToUse,
      level,
      slug,
      status: status || 'active',
    });

    if (!category) {
      return res
        .status(500)
        .json({ message:"category is not created", success: false,error : true });
      
    }
    await category.save()

  // clear module-level images buffer after creating category
  images = [];
    return res
      .status(200)
      .json({ message:"category created",success: true,error :false, data: category });
  }
  catch (error) {
      return res
        .status(400)
        .json({ message: error.message || error, success: false,error : true });

  }
};
const getCategoryController = async (req, res) => {
  try {

    let categoryData = await categoyModal.find();

    // If there are no categories in DB, create a default one and use it
    if (!categoryData || categoryData.length === 0) {
      const defaultCategory = new categoyModal({
        name: "Electronics",
        parentCatName: "",
        parentId: null,
        images: [],
      });
      await defaultCategory.save();
      // reload categoryData to include the newly created default category
      categoryData = [defaultCategory];
    }

    const categoryMap = {};

    categoryData.forEach((cat) => (categoryMap[cat._id] = { ...cat._doc, children: [] }));

    const rootCategories = [];

    categoryData.forEach((cat) => {
      if (cat.parentId) {
        // ensure parent exists in the map before pushing
        if (categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
        } else {
          // Fallback: if parent not found, treat as root
          rootCategories.push(categoryMap[cat._id]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return res.status(200).json({
      message: "Categories fetched successfully",
      data: rootCategories,
      success: true,
      error: false,
    });

  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoyModal.findById(id).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found', success: false, error: true });
    }
    return res.status(200).json({ message: 'Category fetched', data: category, success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // If images provided as JSON string, parse it
    if (update.images && typeof update.images === 'string') {
      try { update.images = JSON.parse(update.images); } catch (e) { /* ignore */ }
    }
    const category = await categoyModal.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found', success: false, error: true });
    }
    Object.keys(update).forEach((k) => { if (update[k] !== undefined) category[k] = update[k]; });
    await category.save();
    return res.status(200).json({ message: 'Category updated', data: category, success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};


// Get categories by level (1 = main, 2 = sub, 3 = third)
const getCategoriesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const categories = await categoyModal.find({ level: parseInt(level) }).lean();
    return res.status(200).json({ 
      message: 'Categories fetched', 
      data: categories, 
      success: true, 
      error: false 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};

// Get subcategories of a parent category
const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    const subcategories = await categoyModal.find({ parentId }).lean();
    return res.status(200).json({ 
      message: 'Subcategories fetched', 
      data: subcategories, 
      success: true, 
      error: false 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};

// Delete category
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has children
    const children = await categoyModal.find({ parentId: id });
    if (children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Please delete child categories first.', 
        success: false, 
        error: true 
      });
    }
    
    const category = await categoyModal.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found', success: false, error: true });
    }
    
    return res.status(200).json({ 
      message: 'Category deleted successfully', 
      success: true, 
      error: false 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};

export { 
  imageUploader,
  createCategoryController,
  getCategoryController, 
  getCategoryById, 
  updateCategoryController,
  getCategoriesByLevel,
  getSubcategories,
  deleteCategoryController
}