import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDB } from "@/lib/db/db";
import lessonModel from "@/lib/models/lesson.model";

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.pathname.split("/").pop();
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const lessons = await lessonModel.find({ user_id }).limit(50).lean();

    const formattedLessons = lessons.map((lesson) => ({
      ...lesson,
      _id: lesson._id?.toString(),
      subtopics: lesson.subtopics?.map((s: any) => s.toString()) || [],
    }));
    return NextResponse.json(formattedLessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
