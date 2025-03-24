import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import Session from "../models/Session.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, location, userImage } = req.body;

  if (!username || !email || !password) {
    throw new Error("يرجى ملء جميع المدخلات.");
  }

  const userExists = await User.findOne({ email });
  if (userExists) res.status(400).send("المستخدم موجود بالفعل");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    location,
    userImage,
  });

  try {
    await newUser.save();
    createToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      location: newUser.location,
      userImage: newUser.userImage,
    });
  } catch (error) {
    res.status(400);
    throw new Error("بيانات المستخدم غير صالحة");
  }
});

const loginUser = async (req, res) => {
  const { email, password, location, image } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const userIP = req.ip;

      const session = new Session({
        user: user._id,
        ip: userIP,
        username: user.username,
        email: user.email,
        location,
        userImage: image,
      });

      await session.save();

      createToken(res, user._id);

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        location,
        image,
      });
    } else {
      res
        .status(401)
        .json({ message: "البريد الإلكتروني أو كلمة المرور غير صالحة" });
    }
  } catch (err) {
    console.error("🔴 خطأ في تسجيل الدخول للمستخدم:", err);
    res.status(500).json({ message: "خطأ في الخادم " });
  }
};

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.location = req.body.location || user.location;
    user.userImage = req.body.userImage || user.userImage;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      location: updatedUser.location,
      userImage: updatedUser.userImage,
    });
  } else {
    res.status(404);
    throw new Error("لم يتم العثور على المستخدم");
  }
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httyOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const sessions = await Session.find({ user: user._id }).sort({
      loginTime: -1,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      sessions,
    });
  } else {
    res.status(404);
    throw new Error("لم يتم العثور على المستخدم.");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("لا يمكن حذف مستخدم المسؤول");
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "تم إزالة المستخدم" });
  } else {
    res.status(404);
    throw new Error("لم يتم العثور على المستخدم.");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("لم يتم العثور على المستخدم");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("لم يتم العثور على المستخدم");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
