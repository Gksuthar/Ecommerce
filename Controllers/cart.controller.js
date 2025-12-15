import CartProduct from "../models/cartproduct.js";
import UserModal from "../models/user.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated, sendError, sendNotFound } from "../utils/responseHandler.js";
import { validateObjectId } from "../utils/validation.js";

// Add to Cart
const addToCartController = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return sendError(res, "Product ID is required");
  }

  const existingItem = await CartProduct.findOne({ userId, productId });
  if (existingItem) {
    return sendError(res, "Item already in cart");
  }

  const cart = await CartProduct.create({ productId, quantity, userId });

  await UserModal.updateOne({ _id: userId }, { $push: { shopping_cart: productId } });

  return sendCreated(res, cart, "Item added to cart successfully");
});

// Get Cart Items
const getCartItemController = asyncHandler(async (req, res) => {
  const userId = req.userId;
  
  const cartItems = await CartProduct.find({ userId }).populate("productId");

  return sendSuccess(
    res,
    cartItems,
    cartItems.length === 0 ? "Cart is empty" : "Cart fetched successfully"
  );
});

// Update Cart Item Quantity
const updateCartItemController = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId, qty } = req.body;

  if (!productId || qty === undefined) {
    return sendError(res, "Product ID and quantity are required");
  }

  if (qty === 0) {
    await CartProduct.findOneAndDelete({ productId, userId });
    return sendSuccess(res, null, "Cart item removed successfully");
  }

  const updatedItem = await CartProduct.findOneAndUpdate(
    { productId, userId },
    { $set: { quantity: qty } },
    { new: true }
  );

  return sendSuccess(res, updatedItem, "Cart updated successfully");
});

// Delete Cart Item
const deletCartItemQty = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { _id } = req.body;

  if (!_id || !validateObjectId(_id)) {
    return sendError(res, "Valid item ID is required");
  }

  const deletedItem = await CartProduct.findByIdAndDelete(_id);
  if (!deletedItem) {
    return sendNotFound(res, "Item not found in cart");
  }

  await UserModal.findByIdAndUpdate(userId, { shopping_cart: [] });

  return sendSuccess(res, null, "Cart item deleted successfully");
});

export {
  addToCartController,
  getCartItemController,
  updateCartItemController,
  deletCartItemQty,
};
