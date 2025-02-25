import jwt from "jsonwebtoken";

const createToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10h", 
  });

  if (!res || !res.cookie) {
    throw new Error("Response object is invalid. Cannot set cookie.");
  }

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 60 * 60 * 1000, 
  });
};

export default createToken;
