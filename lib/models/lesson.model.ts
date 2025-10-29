import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    mermaidCode: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    subtopics: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
