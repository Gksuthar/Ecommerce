import mongoose from "mongoose";
import UserModel from "../models/user.js";
import bcryptjs from "bcryptjs";
import sendEmail from "../config/emailservice.js";
import jwt from "jsonwebtoken";
import generatedRefreshToken from "../utils/generateRefreshToken.js";
import generatedAccessToken from "../utils/generateAccessToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All field are required",
        error: true,
        success: false,
      });
    }
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        message: "You are Already Part Of Our Service",
        error: true,
        success: false,
      });
    }
    const varifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const otpExpiry = Date.now() + 600000;
    const newUser = new UserModel({
      name: name,
      email: email,
      password: hashedPassword,
      otp: varifyCode,
      otp_expiry: otpExpiry,
    });
    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: "Verify Email from Ganesh Site " + varifyCode,
      text: "ganeshutahr",
      html:
        "<h1>Verify your email</h1><p>Use this code: <b>" +
        varifyCode +
        "</b></p>",
    });

    const token = jwt.sign(
      {
        email: newUser.email,
        id: newUser._id,
      },
      process.env.JWT_SECRET
    );

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      error: false,
      user: newUser,
      token: token,
    });

    // const resp = sendEmailFun(email,"Verify Email","","Your Otp is "+varifyCode)
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const emailVarification = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await UserModel.findOne({ email: email });
    const otpTimeout = Date.now();
    if (!user) {
      return res
        .status(400)
        .send({ error: true, success: false, message: "User is not exist " });
    }

    if (user.otp !== otp) {
      return res
        .status(500)
        .send({ error: true, success: false, message: "Your Otp Invalid " });
    }

    if (otpTimeout > user.otp_expiry) {
      return res
        .status(500)
        .send({ error: true, success: false, message: "Your Otp Expired " });
    }

    await user.save();
    return res.status(200).send({
      error: false,
      success: true,
      message: "Email Verifiend Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ error: true, success: false, message: error.message || error });
  }
};

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "all fields  are required",
      });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Oops.. You are not active",
      });
    }
    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        error: true,
        success: false,
        message: " Your are password is incorrect",
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: Date.now(),
    });

    const cookieOption = {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookieOption);
    res.cookie("refreshToken", refreshToken, cookieOption);

    return res.status(200).json({
      error: false,
      success: true,
      message: " Login Successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    const userid = req.userId;
    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.clearCookie("accessToken", cookieOption);
    await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });
    return res.json({
      message: "Logout Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const imageUploader = async (req, res) => {
  try {
      const userId = req.userId;
      if (!userId) {
          return res.status(400).json({
              message: "User ID is required",
              success: false
          });
      }

      const image = req.file;  // Assuming multer .single() middleware
      if (!image) {
          return res.status(400).json({
              message: "No file uploaded",
              success: false
          });
      }

      const options = {
          folder: "user_avatars", // Organized folder in Cloudinary
          use_filename: true,
          unique_filename: true,
          overwrite: false
      };

      const img = await cloudinary.uploader.upload(image.path, options);
      await fs.promises.unlink(image.path); // Safe cleanup

      const user = await UserModel.findOne({ _id: userId });
      if (!user) {
          return res.status(404).json({
              message: "User not found",
              success: false
          });
      }

      if (user.avatar && typeof user.avatar === 'string' && user.avatar.includes('/')) {
          const oldImagePublicId = user.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(oldImagePublicId);
      }

      user.avatar = img.secure_url;  // ✅ Correctly updating the user's avatar
      await user.save();

      return res.status(200).json({
          _id: userId,
          avatar: img.secure_url,
          message: "Avatar updated successfully",
          success: true
      });

  } catch (error) {
      console.error("Image Upload Error:", error);
      return res.status(500).json({
          message: error.message || "Failed to upload image",
          success: false
      });
  }
};



const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId
    const {  name, email, password } = req.body;

    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User is Not Valid",
        success: false,
        error: true,
      });
    }

    let verifyCode = "";
    if (email !== user.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    let hashedPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Update user details
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        name: name,
        email: email,
        verify_email: email !== user.email ? false : true,
        password: hashedPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpiry: verifyCode !== "" ? Date.now() + 60000 : null, // OTP expires in 1 minute
      },
      { new: true }
    );

    // Send verification email if the email was updated
    if (email !== user.email) {
      await sendEmail({
        sendTo: email,
        subject: "Verify Email from Ganesh Site " + verifyCode,
        text: "ganeshutahr",
        html: `<h1>Verify your email</h1><p>Use this code: <b>${verifyCode}</b></p>`,
      });
    }

    return res.status(200).json({
      message: "User Updated successfully",
      success: true,
      error: false,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const forgetPassword=async(req,res)=>{
  try {
    const {email} = req.body
    const user = await UserModel.findOne({email})
    if (!user) {
      return res.status(500).json({message:"User not found",success:false,error:true})
    }

    const verifyCode = Math.floor(100000+Math.random() * 900000).toString();
    
    const updatedUser = await UserModel.findByIdAndUpdate(user._id,{
      otp : verifyCode,
      otp_expiry : Date.now() + 600000
    })

    await sendEmail({
      sendTo: email,
      subject: "Verify Email from Ganesh Site " + verifyCode,
      text: "ganeshutahr",
      html:
        "<h1>Verify your email</h1><p>Use this code: <b>" +
        verifyCode +
        "</b></p>",
    })

    await updatedUser.save(0)


    res.status(200).json({message:"User successfully saved" , error : false , success:true})

  } catch (error) {
    res.status(500).json({message:error.message || error,error:true,success:false})
  }



}
const verifyOtpContoller=async(req,res)=>{
  try {
    const {email,otp} = req.body
  const user = await UserModel.findOne({email})
  if (!user) {
    return res.status(400).json({message:"User not found",success:false,error:true})
  }
  
  if (otp!==user.otp) {
    return res.status(400).json({message:"Otp not Valiid",success:false,error:true})
  }
  
  const curenetTime = Date.now()
  if (curenetTime>user.otp_expiry) {
    return res.status(400).json({message:"Otp expired!",success:false,error:true})
  }
  
  user.otp = ""
  user.otp_expiry = ""
  
  await user.save()
  return res.status(400).json({message:"Otp verify successfully",success:true,error:false})

} catch (error) {
  return res.status(500).json({message:error.message || error,success:false,error:true})
  }


}

const resetpasswordController=async(req,res)=>{
  try {
    
  const {email,password,confirmpassword} = req.body
  if (!email || !password || !confirmpassword) {
    return res.status(404).json({message:"Al fileder arre required",success:false,error:true})
  }
  
  const user = await UserModel.findOne({email})
  
  if (!user) {
    return res.status(400).json({message:"Useer is not found",success:false,error:true})
  }
  
  if (password!==confirmpassword){
    return res.status(400).json({message:"Password is not match",success:false,error:true})
  }

  const salt = await bcryptjs.genSalt(10)
  const hashedPassword = await bcryptjs.hash(password,salt)  
  user.password = hashedPassword

  await user.save()
  return res.status(200).json({message:"password saved", error:false,success:true})

} catch (error) {
  
  return res.status(400).json({message:error.message || error,success:false,error:true})
  }
}


const refreshTokenController=async(req,res)=>{
  try {
    
  const refresh_token = req.cookie.accessToken || req?.headers?.authorization?.split(" ")[1]
  if (!refresh_token) {
    return res.status(401).send({message:"Invalid token",error:true,success:false})
  }
  
  const verifyToken = await jwt.verify(refresh_token,process.env.REFRESH_TOKEN_SECRET)
  if (!verifyToken) {
    return res.status(401).send({message:"Token is expire",error:true,success:false})
  }
  const userId = verifyToken?._id
  const newAccessToken = await generatedRefreshToken(userId)

  const options = {
    httpOnly : true,
    secure:true,
    sameSite : "None"
  }
  
  res.cookie('accessToken',newAccessToken,options)
  return res.json({message:"new Token generated ",error:false,success:true,data:{
    accessToken:newAccessToken
  }})
  
} catch (error) {
  return res.status(401).send({message:error.message || error ,error:true,success:false})
  
  }
}
const userDetails=async(req,res)=>{
  try {
    
  const userId = req.userId
  const user = await UserModel.findOne({_id:userId})
  if (!user) {
    return res.json({message:"User is not exist",error:true,success:false})
  }
  
  return res.status(200).json({message:"user fetched ",error:false,success:true,data:user})
  
} catch (error) {
  return res.status(401).send({message:error.message || error ,error:true,success:false})
  
  }
}
export {
  emailVarification,
  registerUserController,
  loginUserController,
  logoutController,
  imageUploader,
  updateUserDetails,
  forgetPassword,
  verifyOtpContoller,
  resetpasswordController,
  refreshTokenController,
  userDetails

};
