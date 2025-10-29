import { connectToDB } from "@/lib/db/db";
import { extractNodesFromMermaid } from "@/lib/extractNode";
import lessonModel from "@/lib/models/lesson.model";
import subtopicModel from "@/lib/models/subtopic.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { user_id, lesson_name, mermaid_code, model, grade } =
      await req.json();

    if (!user_id || !lesson_name || !mermaid_code || !model || !grade) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    const nodes = extractNodesFromMermaid(mermaid_code);

    const lessonDoc = {
      user_id,
      title: lesson_name,
      mermaidCode: mermaid_code,
      subtopics: nodes,
      model,
      grade,
    };

    const newLesson = await lessonModel.create(lessonDoc);

    return NextResponse.json({
      user_id,
      lesson_id: newLesson._id.toString(),
      lesson_name,
      grade,
      model,
      mermaid_code,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
