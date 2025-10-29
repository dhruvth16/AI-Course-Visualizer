import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  // optionally: vertexai: true, project: …, location: … if using Vertex AI
});

export async function POST(req: NextRequest) {
  try {
    const { lesson_name, model, grade } = await req.json();

    if (!lesson_name || !model || !grade) {
      return new Response("Missing required fields", { status: 400 });
    }

    const prompt = `
Generate a valid Mermaid.js flowchart code for the lesson "${lesson_name}" for grade ${grade}.

Requirements:
- Output only the Mermaid.js code (no explanations, no markdown, no extra text).
- Start strictly with one of: "flowchart TD", "flowchart LR", "graph TD", or "graph LR".
- Include all major subtopics and their dependencies in a logical hierarchy.
- Ensure the code is syntactically correct and does not break when rendered.
- Remove all round brackets and square brackets from labels to prevent rendering errors.
- Use clear and concise labels for nodes (avoid long sentences).
- Verify the diagram flows smoothly and looks balanced.
- Fix any Mermaid syntax issues.
    `;

    // Use the SDK’s generation method (non-streaming for simplicity, streaming also possible)
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const mermaidCode = response.text;

    return new Response(mermaidCode, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating mermaid with GenAI:", error);
    return new Response("Failed to generate Mermaid diagram", { status: 500 });
  }
}
