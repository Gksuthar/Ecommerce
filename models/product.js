import mongoose, { mongo } from 'mongoose'
const productSchema = mongoose.Schema({
    name :{  
        type:String,
        require :true,
    },
    description :{  
        type:String,
        require :true,
    },
    images :[{  
        type:String,
        require :true,
    },
],
brand:{
    type:String,
    default: '',
    },
price:{
    type:Number,
    default: '',
    },
    oldPrice:{
        type:Number,
        default:0
    },
    catName:{
        type:String,
        default:''
    },
    
    catId:{
        type:String,
        default:''
    },
    subCat:{
        type:String,
        default:''
    },
    subCatId:{
        type:String,
        default:''
    },
    thirdSubCat:{   
        type:String,
        default:''
    },
    thirdSubCatId:{
        type:String,
        default:''
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
    },
    countInStock:{ 
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    discount:{
        type:Number,
        default:0
    },
    productRam: [{  
        type: String,  
    }],
    size: [{
        type: String,
    }],
    productWeight: [{
        type: String,
    }],
dateCreated:{
    type:Date,
    default:Date.now
},

},)


const ProductModal = await mongoose.model('Product',productSchema)
export default ProductModal