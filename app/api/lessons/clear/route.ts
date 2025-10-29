import lessonModel from "@/lib/models/lesson.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lesson_id = searchParams.get("lesson_id");
    const user_id = searchParams.get("user_id");

    // Validate input
    if (!lesson_id || !user_id) {
      return NextResponse.json({ error: "Missing lesson_id or user_id" });
    }

    // Find and delete the lesson
    const lesson = await lessonModel.findOneAndDelete({
      _id: lesson_id,
      user_id,
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" });
    }

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
