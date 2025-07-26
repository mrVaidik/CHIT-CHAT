import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 1000 },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  senderUsername: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  roomName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isGuest: { type: Boolean, default: false },
});

export default mongoose.model("Message", MessageSchema);
