import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);
