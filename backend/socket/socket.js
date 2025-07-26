import { Server } from "socket.io";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Message from "../models/Message.js";

const onlineUsers = new Map();
const roomUsers = new Map();

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Authentication token required");

      const decoded = verifyToken(token);
      if (!decoded) throw new Error("Invalid token");

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) throw new Error("User not found");

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    onlineUsers.set(socket.id, {
      userId,
      username: socket.user.username,
      isGuest: socket.user.isGuest,
      room: null,
    });

    console.log(`User connected: ${socket.user.username} (${userId})`);

    socket.on("joinRoom", async ({ roomName }) => {
      try {
        const userData = onlineUsers.get(socket.id);
        const previousRoom = userData.room;

        if (previousRoom && previousRoom !== roomName) {
          await handleLeaveRoom(socket, previousRoom, userId);
        }

        socket.join(roomName);
        onlineUsers.set(socket.id, { ...userData, room: roomName });

        let room = await Room.findOne({ name: roomName });
        if (!room) {
          room = new Room({
            name: roomName,
            description: `Room created by ${userData.username}`,
            createdBy: socket.user.isGuest ? null : socket.user._id,
          });
          await room.save();
          console.log(`Created new room: ${roomName}`);
        }

        const roomData = roomUsers.get(roomName) || new Map();
        roomData.set(userId, userData.username);
        roomUsers.set(roomName, roomData);

        broadcastOnlineUsers(roomName);

        const messages = await getRoomMessages(room._id);
        socket.emit("chatHistory", messages);

        socket.to(roomName).emit("userJoined", {
          username: userData.username,
          message: `${userData.username} joined the room`,
        });

        console.log(`${userData.username} joined ${roomName}`);
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("chatMessage", async ({ content }) => {
      try {
        const userData = onlineUsers.get(socket.id);
        if (!userData?.room || !content?.trim()) return;

        const room = await Room.findOne({ name: userData.room });
        if (!room) return;

        const message = new Message({
          content: content.trim(),
          sender: userData.isGuest ? null : userData.userId,
          senderUsername: userData.username,
          room: room._id,
          roomName: room.name,
          isGuest: userData.isGuest,
        });

        await message.save();

        io.to(userData.room).emit("message", {
          _id: message._id,
          content: message.content,
          senderUsername: userData.username,
          timestamp: message.timestamp,
          isGuest: userData.isGuest,
        });
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Fixed typing indicator implementation
    socket.on("typing", ({ isTyping }) => {
      try {
        const userData = onlineUsers.get(socket.id);
        if (!userData?.room) return;

        // Broadcast to everyone in the room except the sender
        socket.to(userData.room).emit("userTyping", {
          username: userData.username,
          isTyping,
        });

        console.log(
          `Typing: ${userData.username} is ${
            isTyping ? "typing" : "not typing"
          } in ${userData.room}`
        );
      } catch (error) {
        console.error("Typing event error:", error);
      }
    });

    socket.on("disconnect", () => {
      const userData = onlineUsers.get(socket.id);
      if (userData?.room) {
        handleLeaveRoom(socket, userData.room, userData.userId);
      }
      onlineUsers.delete(socket.id);
      console.log(`User disconnected: ${userData?.username}`);
    });

    socket.on("leaveRoom", () => {
      const userData = onlineUsers.get(socket.id);
      if (userData?.room) {
        handleLeaveRoom(socket, userData.room, userData.userId);
        onlineUsers.set(socket.id, { ...userData, room: null });
      }
    });
  });

  async function handleLeaveRoom(socket, roomName, userId) {
    try {
      socket.leave(roomName);

      const roomData = roomUsers.get(roomName);
      if (roomData) {
        const username = roomData.get(userId);
        roomData.delete(userId);

        // Clear typing indicator when user leaves
        socket.to(roomName).emit("userTyping", {
          username,
          isTyping: false,
        });

        // Clean up empty rooms
        if (roomData.size === 0) {
          roomUsers.delete(roomName);
        }

        broadcastOnlineUsers(roomName);

        socket.to(roomName).emit("userLeft", {
          username,
          message: `${username} left the room`,
        });

        console.log(`${username} left ${roomName}`);
      }
    } catch (error) {
      console.error("Leave room error:", error);
    }
  }

  function broadcastOnlineUsers(roomName) {
    const roomData = roomUsers.get(roomName);
    if (roomData) {
      const users = Array.from(roomData.values());
      io.to(roomName).emit("onlineUsers", users);
    }
  }

  async function getRoomMessages(roomId) {
    const messages = await Message.find({ room: roomId })
      .sort({ timestamp: -1 })
      .limit(20);

    return messages
      .map((m) => ({
        _id: m._id,
        content: m.content,
        senderUsername: m.senderUsername,
        timestamp: m.timestamp,
        isGuest: m.isGuest,
      }))
      .reverse();
  }
};
