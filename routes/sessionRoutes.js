import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find().populate("user", "username email");
    res.json(sessions);
  } catch (error) {
    console.error("🔴 Error fetching sessions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/clear", async (req, res) => {
  try {
    await Session.deleteMany({});
    res.json({ message: "All sessions have been cleared successfully!" });
  } catch (error) {
    console.error("🔴 Error deleting sessions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
