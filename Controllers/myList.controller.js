import MyListModal from "../models/myList.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated, sendError, sendNotFound, sendServerError } from "../utils/responseHandler.js";
import { validateRequiredFields, validateObjectId } from "../utils/validation.js";

const addToMyListController = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId, rating, price, oldPrice, brand, discount } = req.body;

  // Validate required fields
  const missingFields = validateRequiredFields(
    ['productId', 'rating', 'price', 'oldPrice', 'brand', 'discount'],
    { ...req.body, userId }
  );
  if (missingFields) {
    return sendError(res, `Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check if already exists
  const existingItem = await MyListModal.findOne({ userId, productId });
  if (existingItem) {
    return sendError(res, "Item already in wishlist", 400);
  }

  // Create new item
  const newItem = await MyListModal.create({
    productId,
    userId,
    rating,
    price,
    oldPrice,
    brand,
    discount,
  });

  return sendCreated(res, newItem, "Item added to wishlist successfully");
});

// Remove from MyList
const removeToMyListController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    return sendError(res, "Invalid item ID");
  }

  const deletedItem = await MyListModal.findByIdAndDelete(id);
  if (!deletedItem) {
    return sendNotFound(res, "Item not found in wishlist");
  }

  return sendSuccess(res, null, "Item removed from wishlist successfully");
});

// Get MyList
const getToMyListController = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const data = await MyListModal.find({ userId }).populate("productId");

  return sendSuccess(
    res,
    data,
    data.length === 0 ? "Wishlist is empty" : "Items fetched successfully"
  );
});

export { addToMyListController, removeToMyListController, getToMyListController };