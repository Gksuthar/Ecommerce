import { timeStamp } from "console";
import mongoose, { mongo } from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required:true,
        trim : true
      },
      images: [
        {
        type: String,
        
      }
    ],
      parentCatName: {
        type: String,
        default: "",
      },
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        default: null,
      },
      level: {
        type: Number,
        default: 1, // 1 = Main Category, 2 = Subcategory, 3 = Third Category
      },
      slug: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },

},{timestamps:true})

const categoryModal = mongoose.model('Category',categorySchema)
export default categoryModal