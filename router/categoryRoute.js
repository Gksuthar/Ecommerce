import express from 'express'
import { Router } from 'express'
import {
  imageUploader,
  createCategoryController,
  getCategoryController, 
  getCategoryById, 
  updateCategoryController,
  getCategoriesByLevel,
  getSubcategories,
  deleteCategoryController
} from '../Controllers/category.controller.js'
import multer from 'multer'
import auth from '../middleware/auth.js'
const storage =  multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'uploads')
    },
    filename : function(req,file,cb){
        cb(null,Date.now()+file.originalname)
    }
})

const upload = multer({storage})
const routerCat = express.Router()

// Image upload
routerCat.post('/imageUpload',upload.array('image'),auth,imageUploader)

// Category CRUD
routerCat.post('/createCategoryController',createCategoryController)
routerCat.get('/',getCategoryController)
routerCat.get('/level/:level', getCategoriesByLevel) 
routerCat.get('/subcategories/:parentId', getSubcategories) 
routerCat.get('/:id', getCategoryById)
routerCat.put('/:id', updateCategoryController)
routerCat.delete('/:id', deleteCategoryController)

export default routerCat