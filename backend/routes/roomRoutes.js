// routes/roomRoutes.js
import express from "express";
import { getMyRooms, createRoom, joinRoom, getRoomDetails, deleteRoom } from "../controllers/roomController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getMyRooms);
router.post("/create", auth, createRoom);
router.post("/join", auth, joinRoom);
router.get("/:roomCode", auth, getRoomDetails);
router.delete("/:roomCode", auth, deleteRoom);


export default router;
