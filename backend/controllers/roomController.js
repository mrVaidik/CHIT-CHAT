import Room from "../models/Room.js";

export const getRooms = async (_, res) => {
  try {
    res.json(
      await Room.find()
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
    );
  } catch (error) {
    res.status(500).json({ error: "Server error fetching rooms" });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Room name required" });
    if (await Room.findOne({ name }))
      return res.status(400).json({ error: "Room name exists" });

    const room = new Room({ name, description, createdBy: req.user._id });
    await room.save();
    await room.populate("createdBy", "username");

    res.status(201).json({ message: "Room created", room });
  } catch (error) {
    res.status(500).json({ error: "Server error creating room" });
  }
};
