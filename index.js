import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

dotenv.config();
const port = process.env.PORT || 5001;

connectDB();

const app = express();

app.set("trust proxy", true);

// إعداد CORS ليتناسب مع الاستضافة
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // استخدم الرابط الفعلي بعد الرفع
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// إعداد الروتات
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sessions", sessionRoutes);



// التعامل مع الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));
