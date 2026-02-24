import express from "express";
import {
  uploadFile,
  getFiles,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

router.post("/upload", uploadFile);
router.get("/:roomId", getFiles);
router.delete("/:id", deleteFile);

export default router;
