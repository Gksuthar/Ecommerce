import express from 'express'
import { createOrder,verifyOrder,getOrder,getAllOrder } from "../Controllers/order.controller.js";
import auth from '../middleware/auth.js';
const orderRouter = express.Router()


orderRouter.post('/makeOrder',auth,createOrder)
orderRouter.post('/verify',auth,verifyOrder)
orderRouter.get('/',auth,getOrder)
orderRouter.get('/allOrder',getAllOrder)
export default orderRouter