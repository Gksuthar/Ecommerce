import mongoose from "mongoose";

const cartProductSchema = mongoose.Schema({
    productId : {
        type:  mongoose.Schema.ObjectId,
        ref : 'Product'
    },
    quantity :{
        type : Number,
    },
    userId :{
        type : mongoose.Schema.ObjectId,
        ref : 'User' 
    },
},{
    timestamps: true})

const CartProduct  = mongoose.model('cartproduct',cartProductSchema)
export default CartProduct  