import mongoose from "mongoose";

const SubtopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    default: null,
  },
}, { timestamps: true });

export default mongoose.models.Subtopic || mongoose.model("Subtopic", SubtopicSchema);
