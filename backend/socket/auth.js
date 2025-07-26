import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication token required."));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error("Invalid or expired token."));
  }

  try {
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("User not found."));
    }
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed due to server error."));
  }
};
