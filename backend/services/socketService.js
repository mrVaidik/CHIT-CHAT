import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const onlineUsers = new Map();
const roomUsers = new Map();

export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        throw new Error("Authentication token required");
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        throw new Error("Invalid or expired token");
      }

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        throw new Error("User not found");
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    try {
      console.log(`User connected: ${socket.id} (${socket.user.username})`);

      // Store user info
      onlineUsers.set(socket.id, {
        userId: socket.user._id,
        username: socket.user.username,
        isGuest: socket.user.isGuest,
        room: null,
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        onlineUsers.delete(socket.id);
      });

      socket.on("error", (error) => {
        console.error(`Socket error (${socket.id}):`, error);
      });
    } catch (error) {
      console.error("Connection setup error:", error);
      socket.disconnect(true);
    }
  });

  io.on("error", (error) => {
    console.error("Socket.IO server error:", error);
  });
};
