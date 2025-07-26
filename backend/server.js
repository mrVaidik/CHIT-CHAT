import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import { socketAuthMiddleware } from "./socket/auth.js";
import { handleConnection, onlineUsers, roomUsers } from "./socket/handlers.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    onlineUsersCount: onlineUsers.size,
    activeRoomsCount: roomUsers.size,
  });
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  handleConnection(io, socket);
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "API Route not found" });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});
