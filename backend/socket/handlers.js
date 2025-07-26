import Room from "../models/Room.js";
import Message from "../models/Message.js";

const onlineUsers = new Map();
const roomUsers = new Map();

export const handleConnection = (io, socket) => {
  console.log(
    `User connected: ${socket.id} (Username: ${socket.user.username}, isGuest: ${socket.user.isGuest})`
  );

  onlineUsers.set(socket.id, {
    userId: socket.user._id,
    username: socket.user.username,
    isGuest: socket.user.isGuest,
    room: null,
  });

  socket.on("joinRoom", async (data) => {
    try {
      const { roomName } = data;
      const user = socket.user;

      console.log(
        `[Join Room] User ${user.username} (${socket.id}) joining: ${roomName}`
      );

      const previousData = onlineUsers.get(socket.id);
      if (previousData && previousData.room && previousData.room !== roomName) {
        console.log(
          `[Join Room] User ${user.username} leaving: ${previousData.room}`
        );
        socket.leave(previousData.room);
        const prevRoomUsers = roomUsers.get(previousData.room) || new Set();
        prevRoomUsers.delete(previousData.username);
        roomUsers.set(previousData.room, prevRoomUsers);
        io.to(previousData.room).emit("onlineUsers", Array.from(prevRoomUsers));
        socket.to(previousData.room).emit("userLeft", {
          username: previousData.username,
          message: `${previousData.username} left the room`,
        });
      }

      socket.join(roomName);

      onlineUsers.set(socket.id, {
        ...onlineUsers.get(socket.id),
        room: roomName,
      });

      const currentRoomUsers = roomUsers.get(roomName) || new Set();
      currentRoomUsers.add(user.username);
      roomUsers.set(roomName, currentRoomUsers);

      let room = await Room.findOne({ name: roomName });
      if (!room) {
        console.log(`[Join Room] Creating room: ${roomName}`);
        room = new Room({
          name: roomName,
          description: `Room created by ${user.username}`,
          createdBy: user.isGuest ? null : user._id,
        });
        await room.save();
      }

      console.log(`[Join Room] Fetching history for: ${roomName}`);
      const recentMessages = await Message.find({ room: room._id })
        .sort({ timestamp: -1 })
        .limit(20);

      const formattedMessages = recentMessages
        .map((msg) => ({
          _id: msg._id,
          content: msg.content,
          senderUsername: msg.senderUsername,
          timestamp: msg.timestamp,
          isGuest: msg.isGuest,
        }))
        .reverse();

      socket.emit("chatHistory", formattedMessages);
      socket.emit("joinedRoom", { roomName, username: user.username });

      io.to(roomName).emit("onlineUsers", Array.from(currentRoomUsers));

      socket.to(roomName).emit("userJoined", {
        username: user.username,
        message: `${user.username} joined the room`,
      });
      console.log(
        `[Join Room] User ${user.username} joined ${roomName} successfully.`
      );
    } catch (error) {
      console.error("[Join Room Error]:", error);
      socket.emit("error", {
        message: "Failed to join room: " + error.message,
      });
    }
  });

  socket.on("chatMessage", async (data) => {
    try {
      const userData = onlineUsers.get(socket.id);
      if (!userData || !userData.room) {
        socket.emit("error", {
          message: "User not in a room or not authenticated.",
        });
        return;
      }

      const { content } = data;
      if (!content || content.trim().length === 0) {
        return;
      }

      const room = await Room.findOne({ name: userData.room });
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      const message = new Message({
        content: content.trim(),
        sender: userData.isGuest ? null : userData.userId,
        senderUsername: userData.username,
        room: room._id,
        roomName: room.name,
        isGuest: userData.isGuest,
      });

      await message.save();

      const messageData = {
        _id: message._id,
        content: message.content,
        senderUsername: userData.username,
        timestamp: message.timestamp,
        isGuest: userData.isGuest,
      };

      io.to(userData.room).emit("message", messageData);
    } catch (error) {
      console.error("[Chat Message Error]:", error);
      socket.emit("error", {
        message: "Failed to send message: " + error.message,
      });
    }
  });

  socket.on("typing", (data) => {
    const userData = onlineUsers.get(socket.id);
    if (userData && userData.room) {
      socket.to(userData.room).emit("userTyping", {
        username: userData.username,
        isTyping: data.isTyping,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const userData = onlineUsers.get(socket.id);
    if (userData && userData.room) {
      console.log(
        `[Disconnect] User ${userData.username} leaving: ${userData.room}`
      );
      const roomUsers_set = roomUsers.get(userData.room);
      if (roomUsers_set) {
        roomUsers_set.delete(userData.username);
        if (roomUsers_set.size === 0) {
          roomUsers.delete(userData.room);
        } else {
          roomUsers.set(userData.room, roomUsers_set);
        }

        io.to(userData.room).emit("onlineUsers", Array.from(roomUsers_set));
        socket.to(userData.room).emit("userLeft", {
          username: userData.username,
          message: `${userData.username} left the room`,
        });
      }
    }
    onlineUsers.delete(socket.id);
  });

  socket.on("leaveRoom", () => {
    const userData = onlineUsers.get(socket.id);
    if (userData && userData.room) {
      console.log(
        `[Leave Room] User ${userData.username} leaving: ${userData.room}`
      );
      socket.leave(userData.room);

      const roomUsers_set = roomUsers.get(userData.room);
      if (roomUsers_set) {
        roomUsers_set.delete(userData.username);
        if (roomUsers_set.size === 0) {
          roomUsers.delete(userData.room);
        } else {
          roomUsers.set(userData.room, roomUsers_set);
        }

        io.to(userData.room).emit("onlineUsers", Array.from(roomUsers_set));
        socket.to(userData.room).emit("userLeft", {
          username: userData.username,
          message: `${userData.username} left the room`,
        });
      }

      onlineUsers.set(socket.id, {
        ...userData,
        room: null,
      });
    }
  });
};

export { onlineUsers, roomUsers };
