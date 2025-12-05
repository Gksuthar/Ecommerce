import { timeStamp } from "console";
import mongoose from "mongoose";
import { type } from "os";

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    orderId: {
      type: String,
      require: [true, "Provide orderId"],
      unique: true,
    },
    // Legacy single product reference (kept for backward compatibility)
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    // New: support multiple items per order
    orderItems: [
      {
        productId: { type: mongoose.Schema.ObjectId, ref: "Product" },
        name: { type: String },
        image: { type: String },
        price: { type: Number, default: 0 },
        oldPrice: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
        subtotal: { type: Number, default: 0 },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      default: "",
    },
    Quantity: {
      type: Number,
      default: 1,
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "Address",
      required:true
    },

    subTotalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


const OrderData = mongoose.model("Order", orderSchema);
export default OrderData;
