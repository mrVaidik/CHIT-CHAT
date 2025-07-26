import express from "express";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ error: "Server error fetching rooms" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!name || name.length < 1) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ error: "Room name already exists" });
    }

    const room = new Room({
      name,
      description: description || "",
      createdBy: userId,
    });

    await room.save();
    await room.populate("createdBy", "username");

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ error: "Server error creating room" });
  }
});

router.get("/:roomName/messages", async (req, res) => {
  try {
    const { roomName } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const room = await Room.findOne({ name: roomName });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const messages = await Message.find({ room: room._id })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const formattedMessages = messages
      .map((msg) => ({
        _id: msg._id,
        content: msg.content,
        senderUsername: msg.senderUsername,
        timestamp: msg.timestamp,
        isGuest: msg.isGuest,
      }))
      .reverse();

    res.json(formattedMessages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});

export default router;
