import { generateWithGoogleModel } from "@/lib/flash";
import { generateWithGemmaModel } from "@/lib/gemma";
import { MODEL_IDS, type SupportedModel } from "@/lib/ai/models";

export { MODEL_IDS } from "@/lib/ai/models";
export { isSupportedModel } from "@/lib/ai/models";

export async function generateMermaidByModel(params: {
  lessonName: string;
  model: SupportedModel;
  grade: string;
}): Promise<string> {
  const { lessonName, model, grade } = params;

  switch (model) {
    case MODEL_IDS.GEMINI_2_5_FLASH:
      return generateWithGoogleModel({
        lessonName,
        model,
        grade,
        kind: "mermaid",
      });
    case MODEL_IDS.GEMMA_4_31B:
      return generateWithGemmaModel({
        lessonName,
        model,
        grade,
        kind: "mermaid",
      });
    default:
      throw new Error("Unsupported model");
  }
}

export async function generateSubtopicByModel(params: {
  lessonName: string;
  subtopicName: string;
  model: SupportedModel;
  grade: string;
}): Promise<string> {
  const { lessonName, subtopicName, model, grade } = params;

  switch (model) {
    case MODEL_IDS.GEMINI_2_5_FLASH:
      return generateWithGoogleModel({
        lessonName,
        subtopicName,
        model,
        grade,
        kind: "subtopic",
      });
    case MODEL_IDS.GEMMA_4_31B:
      return generateWithGemmaModel({
        lessonName,
        subtopicName,
        model,
        grade,
        kind: "subtopic",
      });
    default:
      throw new Error("Unsupported model");
  }
}
