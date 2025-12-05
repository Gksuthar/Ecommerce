import { MongoServerClosedError } from "mongodb"
import mongoose from "mongoose"
import { type } from "node:os"

const addressSchema = mongoose.Schema({
    address_line :{
        type : String,
        default:""
    },
    city:{
        type : String,
        default:""
    },
    state:{
        type : String,
        default:""
    },  
    pincode:{
        type : String,
        default:""
    },
    country:{
        type : String,
        default:""
    },
    mobile:{
        type : String,
        default:""
    },
    status:{
        type : Boolean,
        default:true
    },
    userId:{
        type :String,
        default:""
    }
})
const AddressModel = mongoose.model("Address", addressSchema, "address");
export default AddressModel;