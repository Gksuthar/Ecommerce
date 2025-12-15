// User Service Layer - Business logic separated from controllers

import UserModel from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import generatedRefreshToken from "../utils/generateRefreshToken.js";
import generatedAccessToken from "../utils/generateAccessToken.js";
import sendEmail from "../config/emailservice.js";

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash Password
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

// Compare Password
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};

// Find User by Email
export const findUserByEmail = async (email) => {
  return UserModel.findOne({ email });
};

// Create New User
export const createUser = async (userData) => {
  const { name, email, password } = userData;
  const hashedPassword = await hashPassword(password);
  const otp = generateOTP();
  const otpExpiry = Date.now() + 600000; // 10 minutes

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    otp,
    otp_expiry: otpExpiry,
  });

  return newUser;
};

// Send Verification Email
export const sendVerificationEmail = async (email, otp) => {
  return sendEmail({
    sendTo: email,
    subject: `Verify Email - OTP: ${otp}`,
    text: "Email Verification",
    html: `<h1>Verify your email</h1><p>Use this code: <b>${otp}</b></p>`,
  });
};

// Generate JWT Token
export const generateJWT = (user) => {
  return jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (Date.now() > user.otp_expiry) {
    throw new Error("OTP expired");
  }

  // Clear OTP after verification
  user.otp = null;
  user.otp_expiry = null;
  await user.save();

  return user;
};

// Login User
export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== "Active") {
    throw new Error("Account is not active");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate tokens
  const accessToken = await generatedAccessToken(user._id);
  const refreshToken = await generatedRefreshToken(user._id);

  // Update last login
  await UserModel.findByIdAndUpdate(user._id, { last_login_date: Date.now() });

  return { user, accessToken, refreshToken };
};

// Logout User
export const logoutUser = async (userId) => {
  await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });
};
