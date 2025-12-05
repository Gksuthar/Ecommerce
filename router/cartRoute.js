import express from 'express'
import {addToCartController,getCartItemController,updateCartItemController,deletCartItemQty} from "../Controllers/cart.controller.js";
import auth from '../middleware/auth.js'
const cartRouter = express.Router()

cartRouter.post('/create',auth,addToCartController)
cartRouter.get('/get',auth,getCartItemController)
cartRouter.put('/update-cart',auth,updateCartItemController)
cartRouter.delete('/daleteCart',auth,deletCartItemQty)

export default cartRouter