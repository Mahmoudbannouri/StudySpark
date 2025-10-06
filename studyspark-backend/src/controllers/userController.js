import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js";

// 🧠 Register Controller
export const registeruser = async (req, res) => {
    try {
      const { fullname, email, password } = req.body;
  
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullname,
        email,
        password: hashedPassword,
        role: "student",
      });
  
      // 🧩 Create quota automatically for the new user
      await Quota.create({
        userId: user.id,
        maxUploads: 10,
        usedUploads: 0,
        maxAIRequests: 100,
        usedAIRequests: 0,
      });
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
export const updateUserRole = async (req, res) => {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    res.json(user);
  };
  
// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};
