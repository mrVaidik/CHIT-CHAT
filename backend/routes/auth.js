import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters long" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      isGuest: false,
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || user.isGuest) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ error: "User account corrupted: Missing password hash." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post("/guest", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters long" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const guestUser = new User({
      username,
      isGuest: true,
      password: null, // Ensure your User model allows password to be null
    });

    await guestUser.save();

    const token = generateToken(guestUser._id); // Check this function carefully

    res.json({
      message: "Guest login successful",
      token,
      user: {
        id: guestUser._id,
        username: guestUser.username,
        isGuest: guestUser.isGuest,
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({ error: "Server error during guest login" });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      isGuest: req.user.isGuest,
    },
  });
});

export default router;
