import { timeStamp } from "console";
import { MongoGCPError } from "mongodb";
import mongoose from "mongoose";

const myListSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    userId: {
      type: String,
      require: true,
    },
    rating: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    oldPrice: {
      type: Number,
      require: true,
    },

    brand: {
      type: String,
      require: true,
    },
    discount: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

const MyListModal = mongoose.model("MyList", myListSchema);
export default MyListModal;
