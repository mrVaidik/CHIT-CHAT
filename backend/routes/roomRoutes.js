import express from "express";
import { getRooms, createRoom } from "../controllers/roomController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getRooms);
router.post("/", authenticateToken, createRoom);

export default router;
