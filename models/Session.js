import mongoose from "mongoose";

const sessionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    ip: String,
    username: { type: String, required: true }, 
    email: { type: String, required: true }, 
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    userImage: { type: String },
    loginTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const Session = mongoose.model("Session", sessionSchema);
export default Session;
