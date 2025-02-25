import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        res.clearCookie("jwt"); 
        res.status(401);
        throw new Error("Session expired. Please log in again.");
      }

      req.user = await User.findById(decoded.userId).select("-password");
      
      next();
    } catch (error) {
      res.clearCookie("jwt"); 
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token.");
  }
});
 
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send("Not authorized as an admin.");
  }
};


const protect = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("jwt"); 
    res.status(401).json({ message: "Session expired, please log in again" });
  }
};

export default protect;


export { authenticate, authorizeAdmin , protect };
