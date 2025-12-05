import AddressModel from "../models/address.js";

export const setUserAddress=async(req,res)=>{
    try {
        const userId = req.userId
        const {address_line,city,state,pincode,country,status,mobile} = req.body
        if (!address_line || !city || !state || !pincode || !country || !mobile || !userId) {
            return res.status(400).send({ message: "All fields are required." });
          }
          const newAddress = new AddressModel({
            address_line,
            city,
            state,
            pincode,
            country,
            mobile,
            status: status || true, 
            userId,
          });
          const savedAddress = await newAddress.save();
          res.status(201).send({
            message: "Address saved successfully!",
            data: savedAddress,
          });
      
    } catch (error) {
        res.status(500).send({message:error.message})
    }
}
