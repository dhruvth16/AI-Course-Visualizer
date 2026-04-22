import { connectToDB } from "@/lib/db/db";
import contentModel from "@/lib/models/content.model";
import { NextRequest, NextResponse } from "next/server";
import {
  generateSubtopicByModel,
  isSupportedModel,
} from "@/lib/ai/modelRouter";

async function generateSubtopicContent(
  lessonName: string,
  subtopicName: string,
  model: Parameters<typeof generateSubtopicByModel>[0]["model"],
  grade: string,
): Promise<{ content: string }> {
  const content = await generateSubtopicByModel({
    lessonName,
    subtopicName,
    model,
    grade,
  });

  return { content };
}

export async function POST(req: NextRequest) {
  try {
    const { lesson_name, subtopic_name, model, grade } = await req.json();
    const gradeValue = String(grade || "");

    if (!lesson_name || !subtopic_name || !model || !gradeValue) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!isSupportedModel(model)) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
    }

    await connectToDB();

    const subtopicContent = await generateSubtopicContent(
      lesson_name,
      subtopic_name,
      model,
      gradeValue,
    );

    const contentDoc = {
      text: subtopicContent.content,
      title: subtopic_name,
      metadata: { model, grade },
    };

    const contentResult = await contentModel.create(contentDoc);

    if (!contentResult?._id) {
      return NextResponse.json(
        { error: "Failed to insert content" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      lesson_name,
      subtopic_name,
      model,
      grade: gradeValue,
      subtopic_content: subtopicContent.content,
    });
  } catch (error) {
    console.error("Error creating subtopic:", error);
    return NextResponse.json(
      { error: "Failed to create subtopic" },
      { status: 500 },
    );
  }
}
