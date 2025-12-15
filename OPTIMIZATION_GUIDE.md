# Backend Optimization Guide

## ✅ Optimizations Applied

### 1. **Response Handlers** (`utils/responseHandler.js`)
Centralized response formatting - no more repetitive JSON responses.

**Before:**
```javascript
return res.status(200).json({
  message: "Success",
  success: true,
  error: false,
  data: result
});
```

**After:**
```javascript
import { sendSuccess } from '../utils/responseHandler.js';
return sendSuccess(res, result, "Success");
```

**Available Helpers:**
- `sendSuccess(res, data, message, statusCode)` - 200 OK
- `sendCreated(res, data, message)` - 201 Created
- `sendError(res, message, statusCode)` - Error responses
- `sendNotFound(res, message)` - 404 Not Found
- `sendUnauthorized(res, message)` - 401 Unauthorized
- `sendServerError(res, message, error)` - 500 Server Error

---

### 2. **Async Handler** (`utils/asyncHandler.js`)
Eliminates try-catch blocks in every controller.

**Before:**
```javascript
const myController = async (req, res) => {
  try {
    // logic
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**After:**
```javascript
import { asyncHandler } from '../utils/asyncHandler.js';

const myController = asyncHandler(async (req, res) => {
  // logic - errors automatically caught
});
```

---

### 3. **Validation Utilities** (`utils/validation.js`)
Reusable validation functions.

**Available Validators:**
```javascript
import { 
  validateRequiredFields, 
  validateObjectId, 
  validateEmail, 
  validateNumber,
  sanitizeData 
} from '../utils/validation.js';

// Check missing fields
const missing = validateRequiredFields(['name', 'email'], req.body);
if (missing) {
  return sendError(res, `Missing: ${missing.join(', ')}`);
}

// Validate MongoDB ObjectId
if (!validateObjectId(id)) {
  return sendError(res, "Invalid ID");
}

// Validate email
if (!validateEmail(email)) {
  return sendError(res, "Invalid email");
}

// Sanitize data (only allow specific fields)
const clean = sanitizeData(req.body, ['name', 'email', 'phone']);
```

---

### 4. **Service Layer** (`services/`)
Business logic separated from controllers.

**Example: User Service** (`services/user.service.js`)
```javascript
// Reusable functions:
- generateOTP()
- hashPassword(password)
- comparePassword(plain, hashed)
- findUserByEmail(email)
- createUser(userData)
- sendVerificationEmail(email, otp)
- verifyOTP(email, otp)
- loginUser(email, password)
- logoutUser(userId)
```

**Usage in Controller:**
```javascript
import * as userService from '../services/user.service.js';

const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await userService.loginUser(email, password);
  return sendSuccess(res, { accessToken, refreshToken });
});
```

---

### 5. **Database Helpers** (`utils/dbHelpers.js`)
Reusable CRUD operations with pagination.

**Available Functions:**
```javascript
import { findAllWithPagination, findById, createDocument, updateDocument, deleteDocument } from '../utils/dbHelpers.js';

// Get paginated products
const result = await findAllWithPagination(
  ProductModel, 
  req.query, 
  'category', // populate
  'name price images' // select fields
);
// Returns: { data: [], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }

// Find by ID
const product = await findById(ProductModel, id, 'category');

// Create
const newProduct = await createDocument(ProductModel, data);

// Update
const updated = await updateDocument(ProductModel, id, data);

// Delete
const deleted = await deleteDocument(ProductModel, id);
```

---

### 6. **API Configuration** (`config/apiConfig.js`)
Centralized constants and configs.

**Available Configs:**
```javascript
import { API_CONFIG, getPaginationParams, getSortParams } from '../config/apiConfig.js';

// Use constants
API_CONFIG.PAGINATION.DEFAULT_LIMIT // 10
API_CONFIG.COOKIE_OPTIONS // { httpOnly, secure, sameSite }
API_CONFIG.OTP.EXPIRY_TIME // 600000 (10 min)
API_CONFIG.STATUS.SUCCESS // 200

// Pagination helper
const { page, limit, skip } = getPaginationParams(req.query);

// Sort helper
const sort = getSortParams(req.query); // { createdAt: -1 }
```

---

### 7. **Global Error Handler** (`middleware/errorHandler.js`)
Catches all unhandled errors automatically.

**Already Added to `index.js`:**
```javascript
import { errorHandler } from './middleware/errorHandler.js';
// Must be LAST middleware
app.use(errorHandler);
```

**Handles:**
- Mongoose validation errors
- Duplicate key errors (11000)
- JWT errors
- Custom errors
- Generic 500 errors

---

## 📝 Migration Examples

### Example 1: Refactored MyList Controller
**Before:** 191 lines with repetitive try-catch
**After:** 57 lines, clean and readable

### Example 2: Refactored Cart Controller  
**Before:** Repetitive error handling
**After:** Uses asyncHandler, response helpers, validation

### Example 3: User Controller
**Before:** Business logic mixed in controller
**After:** Service layer handles logic, controller is thin

---

## 🚀 How to Apply to Remaining Controllers

### Step 1: Import utilities
```javascript
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/responseHandler.js';
import { validateRequiredFields, validateObjectId } from '../utils/validation.js';
import { findAllWithPagination } from '../utils/dbHelpers.js';
```

### Step 2: Wrap controller with asyncHandler
```javascript
export const myController = asyncHandler(async (req, res) => {
  // No try-catch needed
});
```

### Step 3: Use response helpers
```javascript
// Instead of res.status(200).json({...})
return sendSuccess(res, data, "Message");

// Instead of res.status(400).json({...})
return sendError(res, "Error message");
```

### Step 4: Use validation helpers
```javascript
const missing = validateRequiredFields(['field1', 'field2'], req.body);
if (missing) return sendError(res, `Missing: ${missing.join(', ')}`);
```

---

## 📊 Benefits

✅ **Reduced Code:** 40-60% less code  
✅ **Consistency:** All responses follow same format  
✅ **Maintainability:** Change one file, affects all controllers  
✅ **Error Handling:** Centralized, no more missed errors  
✅ **Reusability:** Write once, use everywhere  
✅ **Type Safety:** Clear function signatures  
✅ **Performance:** Optimized DB queries with pagination  

---

## 🎯 Next Steps

1. Apply same pattern to remaining controllers:
   - `product.controller.js`
   - `category.controller.js`
   - `address.controller.js`
   - `order.controller.js`
   - `review.controller.js`

2. Create more service files as needed:
   - `product.service.js`
   - `order.service.js`
   - `email.service.js`

3. Add more helpers:
   - File upload helpers
   - Image processing helpers
   - Email templates

---

## 💡 Quick Reference

**Response:**
```javascript
sendSuccess(res, data, message)
sendError(res, message, statusCode)
sendCreated(res, data, message)
```

**Validation:**
```javascript
validateRequiredFields(fields, data)
validateObjectId(id)
validateEmail(email)
```

**Database:**
```javascript
findAllWithPagination(Model, query, populate, select)
createDocument(Model, data)
updateDocument(Model, id, data)
```

**Error Handling:**
```javascript
asyncHandler(async (req, res) => { /* logic */ })
```
