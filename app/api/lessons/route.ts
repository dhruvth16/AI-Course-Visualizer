import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/db/db";
import lessonModel from "@/lib/models/lesson.model";

export async function GET(req: NextRequest) {
  const lesson_id = req.nextUrl.searchParams.get("lesson_id") as string;
  const user_id = req.nextUrl.searchParams.get("user_id") as string;
  try {
    await connectToDB();

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(lesson_id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    // ✅ Find lesson by ID and user
    const lessonRes = await lessonModel
      .findOne({
        _id: lesson_id,
        user_id,
      })
      .lean();

    // handle possible array union from typings and normalize to a single document
    const lesson = Array.isArray(lessonRes) ? lessonRes[0] : lessonRes;

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // ✅ Convert _id to string
    lesson._id = (lesson._id as any).toString();

    // ✅ Extract subtopic labels if available
    const subtopics = Array.isArray(lesson.subtopics)
      ? lesson.subtopics
          .filter((s: any) => s && s.label)
          .map((s: any) => s.label)
      : [];

    lesson.subtopics = subtopics;

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson", details: String(error) },
      { status: 500 }
    );
  }
}
