import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import productRouter from './router/productRouter.js'
dotenv.config()
import router  from './router/userRoute.js'
import connectDB from './config/db.js'
import morgan from 'morgan'
import bodyParser from "body-parser";
import routerCat from './router/categoryRoute.js'
import cartRouter from './router/cartRoute.js'
import MyListRouter from './router/myList.js'
import orderRouter from './router/orderRoute.js'
import addressRouter from './router/address.js'
import reviewRouter from './router/reviewRouter.js'
import blogRouter from './router/blogRoute.js'
import bannerRouter from './router/bannerRoute.js'
const app = express()
app.use(cookieParser())
app.use(express.json())
// Serve uploaded files (product/category images) statically at /uploads
import path from 'path'
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Allow all CORS origins for development
app.use(cors());
app.use('/api/user',router)
app.use('/api/routerCategory',routerCat)
// added alias for frontend consistency: use '/api/category' as well
app.use('/api/category', routerCat)
app.use('/api/cart',cartRouter)
app.use('/api/product',productRouter)
app.use('/api/mylist',MyListRouter)
app.use('/api/order',orderRouter)
app.use('/api/address',addressRouter)
app.use('/api/review',reviewRouter)
app.use('/api/blog', blogRouter)
app.use('/api/banners', bannerRouter)
app.use(bodyParser.json());

connectDB().then(()=>{  
    app.listen(process.env.PORT,()=>{
        console.log("The server is running "+process.env.PORT)
    })
}).catch((error)=>{
    console.error("Error : "+error)
})