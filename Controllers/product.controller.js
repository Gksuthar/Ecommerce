import mongoose from "mongoose";
import ProductModal from "../models/product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const imageUploader = async (req, res) => {
  try {
    const { files } = req;

    if (!files?.length) {
      return res.status(400).json({ 
        message: "No files uploaded", 
        success: false 
      });
    }

    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      await fs.unlink(file.path).catch(() => {});
      return result.secure_url;
    });

    const uploaded = await Promise.all(uploadPromises);

    return res.status(200).json({
      message: "Images uploaded successfully",
      images: uploaded,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ 
      message: error.message, 
      success: false, 
      error: true 
    });
  }
};

const createProduct = async (req, res) => {

  try {
    const {
      name,
      description,
      brand,
      price,
      oldPrice,
      catName,
      catId,
      subCatId,
      subCat,
      thirdSubCat,
      thirdSubCatId,
      category,
      countInStock,
      rating,
      isFeatured,
      discount,
      productRam,
      size,
      productWeight,
    } = req.body;

    const imagesFromBody = req.body.images || [];
    const newProduct = new ProductModal({
      name,
      description,
      images: imagesFromBody,
      brand,
      price,
      oldPrice,
      catName,
      catId,
      subCatId,
      subCat,
      thirdSubCat,
      thirdSubCatId,
      category,
      countInStock,
      rating,
      isFeatured,
      discount,
      productRam,
      size: Array.isArray(size) 
  ? size.map(item => item.trim()) 
  : size 
    ? size.split(',').map(item => item.trim()) 
    : []
,
      productWeight,
    });
    const savedProduct = await newProduct.save();
  // no global image state to clear

    if (!savedProduct) {
      return res
        .status(500)
        .json({ message: "Product Not Created", success: false, error: true });
    }

    return res
      .status(200)
      .json({ data: savedProduct, success: true, error: false });

  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: "Invalid product ID", 
        success: false, 
        error: true 
      });
    }

    const updatedProduct = await ProductModal.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        message: "Product not found", 
        success: false, 
        error: true 
      });
    }

    return res.status(200).json({ 
      message: "Product updated successfully", 
      success: true, 
      data: updatedProduct
    });

  } catch (error) {
    return res.status(500).json({ 
      message: error.message, 
      success: false, 
      error: true 
    });
  }
};

const updateProductQnty = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || isNaN(quantity)) {
      return res.status(400).send({ 
        message: "Invalid input data", 
        success: false, 
        error: true 
      });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).send({ 
        message: "Quantity must be greater than 0", 
        success: false, 
        error: true 
      });
    }

    const product = await ProductModal.findById(productId);
    if (!product) {
      return res.status(404).send({ 
        message: "Item not found", 
        success: false, 
        error: true 
      });
    }

    if (product.countInStock < qty) {
      return res.status(400).send({ 
        message: "Insufficient stock", 
        success: false, 
        error: true 
      });
    }

    product.countInStock -= qty;
    const updatedProduct = await product.save();

    return res.status(200).send({ 
      message: "Product updated successfully", 
      success: true, 
      error: false,
      data: updatedProduct
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).send({ 
      message: "Internal Server Error", 
      success: false, 
      error: true,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    const totalPosts = await ProductModal.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModal.find()
      .populate("category")
      .skip((page - 1) * perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", success: false, error: true });
    }

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: products,
        success: true,
        error: false,
        totalPages: totalPages,
        page: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllProductsBycatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    const { id } = req.params; 

    const totalPosts = await ProductModal.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const { category } = req.body;
    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModal.find({ catId: req.query.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", success: false, error: true });
    }

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: products,
        success: true,
        error: false,
        totalPages: totalPages,
        page: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllProductsBycatName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);

    const totalPosts = await ProductModal.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModal.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", success: false, error: true });
    }

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: products,
        success: true,
        error: false,
        totalPages: totalPages,
        page: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllProductsFilterByPrice = async (req, res) => {
  try {
    let productList = [];
    if (req.query.catId !== "" && req.query.catId !== undefined) {
      const ProductListArr = await ProductModal.find({
        catId: req.query.catId,
      }).populate("category");

      productList = ProductListArr;
    }
    if (req.query.subCat !== "" && req.query.subCat !== undefined) {
      const ProductListArr = await ProductModal.find({
        subCatId: req.query.subCatId,
      }).populate("category");

      productList = ProductListArr;
    }
    if (req.query.thirdSubCat !== "" && req.query.thirdSubCat !== undefined) {
      const ProductListArr = await ProductModal.find({
        thirdSubCatId: req.query.thirdSubCatId,
      }).populate("category");

      productList = ProductListArr;
    }

    const filterProducts = productList.filter((product) => {
      if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
        return false;
      }
      if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
        return false;
      }
      return true;
    });

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: filterProducts,
        success: true,
        error: false,
        totalPages: 0,
        page: 0,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllProductsByRating = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const perPage = parseInt(req.query.perPage) || 10; 

    let filters = {};
    
    if (req.query.rating) {
      filters.rating =  req.query.rating       
    }
    if (req.query.catId && req.query.catId !== '') {
      filters.catId = req.query.catId;
    }
    if (req.query.subCatId && req.query.subCatId !== '') {
      filters.subCatId = req.query.subCatId;
    }
    if (req.query.thirdSubCat && req.query.thirdSubCat !== '') {
      filters.thirdSubCat = req.query.thirdSubCat;
    }

    const ProductListArr = await ProductModal.find(filters).populate('category').skip((page - 1) * perPage).limit(perPage);

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: ProductListArr,
        success: true,
        error: false,
        totalPages: 0,
        page: 0,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllProductsCount = async (req, res) => {
  try {
    
    const productsCount = await ProductModal.countDocuments()
    if (!productsCount) {
        return res
          .status(500)
          .json({ success: false, error: true });
      
        }
        return res
          .status(200)
          .json({data:productsCount, success: true, error: false });
    
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllFeatureProducts = async (req, res) => {
  try {
    
    const products = await ProductModal.find({
      isFeatured:true
    }).populate('category')  
    if (!products) {
        return res
          .status(500)
          .json({ success: false, error: true });
      
        }
        return res
          .status(200)
          .json({data:products, success: true, error: false });
    
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const deleteProduct = async (req, res) => {
  try {
    
    const products = await ProductModal.findById(req.params.id).populate('category')
    if (!products) {
        return res
          .status(400)
          .json({ success: false, error: true });
      
        }
        const images  = products.images
        for(let img of images){
          const imageUrl = img;
          const urlArr = imageUrl.split('/')
          const image = urlArr[urlArr.length-1]
          const imageName = image.split(".")[0];
          if (imageName) {
            cloudinary.uploader.destroy(imageName,(error,result)=>{
              if (error) {
                console.error('Error deleting image:', error);
              }
            })

          }

        }
        const deleteProduct = await ProductModal.findByIdAndDelete(req.params.id)
        if (!deleteProduct) {       
          return res
            .status(404)
            .json({ message:"product not deleted", success: false, error: true });
          }
          
          return res
            .status(200)
            .json({ message:"product  deleted", success: true, error:false });
  
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getProduct = async (req, res) => {
  try {
    
    const product = await ProductModal.findById(req.params.id).populate('category')
    if (!product) {
        return res
          .status(400)
          .json({message:"The product is not found", success: false, error: true });
      
        }
       
          return res
            .status(200)
            .json({ message:"product fetched", success: true, error:false,product:product});
  
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

export {
  imageUploader,
  createProduct,
  updateProduct,
  updateProductQnty,
  getAllProducts,
  getAllProductsBycatId,
  getAllProductsBycatName,
  getAllProductsFilterByPrice,
  getAllProductsByRating,
  getAllProductsCount,
  getAllFeatureProducts,
  deleteProduct,
  getProduct

};
