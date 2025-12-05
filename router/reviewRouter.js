import express from 'express';
import { createReview, getProductReviews } from '../Controllers/review.controller.js'
import Auth from '../middleware/auth.js'
const reviewRouter = express.Router();

reviewRouter.post('/create-review',Auth, createReview);
reviewRouter.get('/product-reviews/:productId',Auth, getProductReviews); 

export default reviewRouter;
