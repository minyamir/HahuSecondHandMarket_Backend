import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";
import { sendWelcomeEmail } from "./email.service.js";

export const registerUser = async ({ fullName, email, password, phone }) => {
  if (!fullName || !email || !password) {
    const error = new Error("Full name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone || ""
  });

  console.log("User created:", user.email);

  try {
    await sendWelcomeEmail({
      toEmail: user.email,
      fullName: user.fullName
    });
    console.log("Welcome email sent to:", user.email);
  } catch (emailError) {
    console.error("Welcome email failed:", emailError.message);
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};