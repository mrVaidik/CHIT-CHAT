import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { connect } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import socketSetup from "./socket/socket.js";

const app = express();
const server = http.createServer(app);

connect();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

socketSetup(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
