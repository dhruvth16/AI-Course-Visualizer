import { NextRequest } from "next/server";
import { generateMermaidByModel, isSupportedModel } from "@/lib/ai/modelRouter";

export async function POST(req: NextRequest) {
  const { lesson_name, model, grade } = await req.json();
  const gradeValue = String(grade || "");

  if (!lesson_name || !model || !gradeValue) {
    return new Response("Missing required fields", { status: 400 });
  }
  if (!isSupportedModel(model)) {
    return new Response("Unsupported model", { status: 400 });
  }

  let mermaidCode = "";

  try {
    mermaidCode = await generateMermaidByModel({
      lessonName: lesson_name,
      model,
      grade: gradeValue,
    });
  } catch (error) {
    console.error("Error generating mermaid code:", error);
    return new Response("Failed to generate Mermaid diagram", { status: 500 });
  }

  return new Response(mermaidCode, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
