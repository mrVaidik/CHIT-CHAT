import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "token required" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ error: "Invalid token" });

  try {
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};
