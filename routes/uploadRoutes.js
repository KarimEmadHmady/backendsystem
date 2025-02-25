import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// إعداد التخزين باستخدام Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // اسم الفولدر على Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // أنواع الصور المسموح بها
  },
});

const upload = multer({ storage });

// الراوت الخاص برفع الصور
router.post("/", upload.single("image"), (req, res) => {
  if (req.file && req.file.path) {
    res.status(200).send({
      message: "Image uploaded successfully",
      imageUrl: req.file.path, // رابط الصورة من Cloudinary
    });
  } else {
    res.status(400).send({ message: "No image uploaded" });
  }
});

export default router;
