import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies && req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "غير مصرح يرجى تسجيل دخول مرة اخرى" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "لم يتم العثور على المستخدم." });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى." });
    } else if (error.name === "JsonWebTokenError") {
      res.clearCookie("jwt"); // ✅ امسح التوكن فقط لو كان غير صالح
      return res.status(401).json({ message: "الرمز غير صالح. يرجى تسجيل الدخول مرة أخرى." });
    }

    return res.status(401).json({ message: "غير مصرح يرجى تسجيل دخول مرة اخرى " });
  }
});


const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "غير مصرح له كمسؤول." }); 
  }
};

export { authenticate, authorizeAdmin };
