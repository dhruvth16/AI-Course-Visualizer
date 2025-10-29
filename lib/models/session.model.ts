import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" },
});

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
