import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || username.length < 3)
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    const user = new User({
      username,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();

    res.status(201).json({
      message: "User registered",
      token: generateToken(user._id),
      user: { id: user._id, username, isGuest: false },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.isGuest || !user.password)
      return res.status(400).json({ error: "Invalid credentials" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: { id: user._id, username, isGuest: false },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const guestLogin = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.length < 3)
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    if (await User.findOne({ username }))
      return res.status(400).json({ message: "Username already taken" });

    const guestUser = new User({ username, isGuest: true });
    await guestUser.save();

    res.json({
      message: "Guest login successful",
      token: generateToken(guestUser._id),
      user: { id: guestUser._id, username, isGuest: true },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during guest login" });
  }
};

export const getMe = (req, res) =>
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      isGuest: req.user.isGuest,
    },
  });
