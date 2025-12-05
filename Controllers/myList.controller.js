import MyListModal from "../models/myList.js";
const addToMyListController=async(req,res)=>{
    try {
        const userId = req.userId    
        const {
            productId,
            rating,
            price,
            oldPrice,
            brand,
            discount,
          } = req.body;  
          if (!productId || !userId || !rating || !price || !oldPrice || !brand || !discount) {
            return res.status(400).json({
              message: "All fields are required",
              success: false,
              error: true,
            });
          }

          const item = await MyListModal.findOne({userId:userId,productId:productId})
          if (item) {
            return res.status(400).json({
                message: "Item already in MyList ",
                data: item,
                success: true,
                error: false,
              });
          }

          const newItem = new MyListModal({
            productId,
            userId,
            rating,
            price,
            oldPrice,
            brand,
            discount,
          });
          await newItem.save();

    return res.status(201).json({
      message: "Item added to MyList successfully",
      data: newItem,
      success: true,
      error: false,
    });
    } catch (error) {
        res.status(500).send({message:error.message || error , success:false,error:true})
    }
}
const removeToMyListController=async(req,res)=>{
    try {
          const item = await MyListModal.findById(req.params.id)
          if (!item) {
            return res.status(400).json({
                message: "Item not in MyList ",
                data: item,
                success: true,
                error: false,
              });
          }
          
          const daleteItem = await MyListModal.findByIdAndDelete(item)
          if (!daleteItem) {
            return res.status(400).json({
                message: "Item not Deleted ",
                data: item,
                success: true,
                error: false,
              });
          }
    return res.status(201).json({
      message: "Item Deleted From  MyList successfully",
      success: true,
      error: false,
    });
    } catch (error) {
        res.status(500).send({message:error.message || error , success:false,error:true})
    }
}
const getToMyListController = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await MyListModal.find({ userId }).populate("productId");
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Wishlist is empty",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Items fetched from MyList successfully",
      data: data,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};

export {addToMyListController,removeToMyListController,getToMyListController}