import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"], 
  },
});

const upload = multer({ storage });


router.post("/", upload.single("image"), (req, res) => {
  if (req.file && req.file.path) {
    res.status(200).send({
      message: "Image uploaded successfully",
      imageUrl: req.file.path, 
    });
  } else {
    res.status(400).send({ message: "No image uploaded" });
  }
});

export default router;
