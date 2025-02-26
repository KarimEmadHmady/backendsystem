import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

// ✅ دالة التحقق من المستخدم (المصادقة)
const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies && req.cookies.jwt;
  console.log("Cookies:", req.cookies); // ✅ للتأكد من استقبال الكوكيز

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found." });
    }

    next();
  } catch (error) {
    res.clearCookie("jwt"); // ✅ حذف الكوكيز فقط لو فشل التحقق

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    return res.status(401).json({ message: "Not authorized, token failed." });
  }
});

// ✅ دالة التحقق من صلاحيات الأدمن
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin." }); 
  }
};

export { authenticate, authorizeAdmin };
