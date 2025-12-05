import mongoose from "mongoose"

 const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB)
        console.log("database connected")
    } catch (error) {
     console.error("The Error : "+error);
        
    }
}

export default connectDB