import Room from "../models/Room.js";
import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const { roomName } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const room = await Room.findOne({ name: roomName });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const messages = await Message.find({ room: room._id })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(
      messages
        .map((m) => ({
          _id: m._id,
          content: m.content,
          senderUsername: m.senderUsername,
          timestamp: m.timestamp,
          isGuest: m.isGuest,
        }))
        .reverse()
    );
  } catch (error) {
    res.status(500).json({ error: "Server error fetching messages" });
  }
};
