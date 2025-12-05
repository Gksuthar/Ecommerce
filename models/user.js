import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provide name"],
    },
    email: {
      type: String,
      required: [true, "Provide Email"],
      unique: true,
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Provide Password"],
    },
    avatar: { type: [String] },
    mobile: {
      type: Number,
      default: null,
    },
    last_login_date: {
      type: Date,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "address",
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "cartproduct",
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "order",
      },
    ],
    otp: {
      type: Number,
      default: null,
    },
    otp_expiry: {
      type: Date,
      default: "",
    },
    user_type: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    refresh_token: {
      type: String, 
      default: "",
    },
    generated_token: {
      type: String, 
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
