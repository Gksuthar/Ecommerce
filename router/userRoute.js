import express from "express";
import { emailVarification, registerUserController, loginUserController, logoutController, imageUploader,updateUserDetails,forgetPassword,verifyOtpContoller,resetpasswordController,refreshTokenController,userDetails } from "../Controllers/user.controller.js";
import auth from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`); 
    }
});

const upload = multer({ storage });

router.post('/register', registerUserController);
router.post('/verifyEmail', emailVarification);
router.post('/Login', loginUserController);
router.post('/Logout', logoutController);
router.post('/user-avatar', auth, upload.single('avatar'), imageUploader);
router.put('/:id',auth,updateUserDetails);
router.post('/forgetpassword',forgetPassword);
router.post('/verifyOtp',verifyOtpContoller);
router.post('/resetpassword',resetpasswordController);
router.post('/refeshToken',refreshTokenController);
router.get('/user-details',auth,userDetails);
router.get('/', async (req, res) => {
  try {
    const users = await (await import('../models/user.js')).default.find({})
      .select('-password -otp -otp_expiry')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
