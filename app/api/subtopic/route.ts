// import { connectToDB } from "@/lib/db/db";
// import contentModel from "@/lib/models/content.model";
// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// async function generateSubtopicContent(
//   lessonName: string,
//   subtopicName: string,
//   model: string,
//   grade: string
// ): Promise<{ content: string }> {
//   const genAI = new GoogleGenAI({
//     apiKey: process.env.GOOGLE_GENAI_API_KEY!,
//   });
//   const prompt = `
// Generate a short, well-structured educational explanation for the subtopic "${subtopicName}"
// under the lesson "${lessonName}" for grade ${grade}.
// Keep it clear, concise, and easy to understand for students of that grade.
// Avoid unnecessary complexity or jargon.
// `;
//   const response = await genAI.models.generateContent({
//     model,
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: prompt }],
//       },
//     ],
//   });
//   const content = response.text?.trim() || "";
//   return { content };
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { lesson_name, subtopic_name, model, grade } = await req.json();

//     if (!lesson_name || !subtopic_name || !model || !grade) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     await connectToDB();

//     const subtopicContent = await generateSubtopicContent(
//       lesson_name,
//       subtopic_name,
//       model,
//       grade
//     );

//     const contentDoc = {
//       text: subtopicContent.content,
//       title: subtopic_name,
//       metadata: { model, grade },
//     };

//     const contentResult = await contentModel.create(contentDoc);

//     if (!contentResult?._id) {
//       return NextResponse.json(
//         { error: "Failed to insert content" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       lesson_name,
//       subtopic_name,
//       model,
//       grade,
//       subtopic_content: subtopicContent.content,
//     });
//   } catch (error) {
//     console.error("Error creating subtopic:", error);
//     return NextResponse.json(
//       { error: "Failed to create subtopic" },
//       { status: 500 }
//     );
//   }
// }

import axios from "axios";
import { connectToDB } from "@/lib/db/db";
import contentModel from "@/lib/models/content.model";
import { NextRequest, NextResponse } from "next/server";

const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

async function generateSubtopicContent(
  lessonName: string,
  subtopicName: string,
  model: string,
  grade: string,
): Promise<{ content: string }> {
  try {
    const prompt = `
Generate a short, well-structured educational explanation for the subtopic "${subtopicName}" 
under the lesson "${lessonName}" for grade ${grade}. 
Keep it clear, concise, and easy to understand for students of that grade.
Avoid unnecessary complexity or jargon.
    `;

    const response = await axios.post(
      invokeUrl,
      {
        model: model || "google/gemma-4-31b-it",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.95,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          Accept: "application/json",
        },
      },
    );

    const content = response.data?.choices?.[0]?.message?.content?.trim() || "";

    return { content };
  } catch (error: any) {
    console.error(
      "Error generating content (NVIDIA):",
      error?.response?.data || error.message,
    );
    return { content: "" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { lesson_name, subtopic_name, model, grade } = await req.json();

    if (!lesson_name || !subtopic_name || !model || !grade) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDB();

    const subtopicContent = await generateSubtopicContent(
      lesson_name,
      subtopic_name,
      model,
      grade,
    );

    if (!subtopicContent.content) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 },
      );
    }

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
      grade,
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
