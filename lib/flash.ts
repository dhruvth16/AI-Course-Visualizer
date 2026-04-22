import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  // optionally: vertexai: true, project: …, location: … if using Vertex AI
});

export type GenerationKind = "mermaid" | "subtopic";

function buildGooglePrompt(params: {
  kind: GenerationKind;
  lessonName: string;
  grade: string;
  subtopicName?: string;
}) {
  const { kind, lessonName, grade, subtopicName } = params;

  if (kind === "subtopic") {
    return `
Generate a short, well-structured educational explanation for the subtopic "${subtopicName}"
under the lesson "${lessonName}" for grade ${grade}.
Keep it clear, concise, and easy to understand for students of that grade.
Avoid unnecessary complexity or jargon.
`;
  }

  return `
Generate a valid Mermaid.js flowchart code for the lesson "${lessonName}" for grade ${grade}.

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
}

export async function generateWithGoogleModel(params: {
  lessonName: string;
  model: string;
  grade: string;
  kind: GenerationKind;
  subtopicName?: string;
}): Promise<string> {
  const prompt = buildGooglePrompt({
    kind: params.kind,
    lessonName: params.lessonName,
    grade: params.grade,
    subtopicName: params.subtopicName,
  });

  const response = await ai.models.generateContent({
    model: params.model,
    contents: prompt,
  });

  return response.text?.trim() || "";
}

export async function googleFlashRes(
  lesson_name: string,
  model: string,
  grade: string,
) {
  try {
    return await generateWithGoogleModel({
      lessonName: lesson_name,
      model,
      grade,
      kind: "mermaid",
    });
  } catch (error) {
    console.error("Error generating mermaid with GenAI:", error);
    throw new Error("Failed to generate Mermaid diagram");
  }
}
