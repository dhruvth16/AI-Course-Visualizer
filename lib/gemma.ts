import axios from "axios";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

type GenerationKind = "mermaid" | "subtopic";

function buildGemmaPrompt(params: {
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

export async function generateWithGemmaModel(params: {
  lessonName: string;
  model: string;
  grade: string;
  kind: GenerationKind;
  subtopicName?: string;
}): Promise<string> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
  const prompt = buildGemmaPrompt({
    kind: params.kind,
    lessonName: params.lessonName,
    grade: params.grade,
    subtopicName: params.subtopicName,
  });

  const response = await axios.post(
    invokeUrl,
    {
      model: params.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: params.kind === "mermaid" ? 4096 : 1024,
      temperature: 0.7,
      top_p: 0.95,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        Accept: "application/json",
      },
      responseType: "json",
    },
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function gemmaRes(
  lesson_name: string,
  model: string,
  grade: string,
) {
  try {
    return await generateWithGemmaModel({
      lessonName: lesson_name,
      model,
      grade,
      kind: "mermaid",
    });
  } catch (error: any) {
    console.error(
      "Error generating mermaid with NVIDIA API:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to generate Mermaid diagram");
  }
}
