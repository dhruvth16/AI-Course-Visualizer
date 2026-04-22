export const MODEL_IDS = {
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
  GEMMA_4_31B: "google/gemma-4-31b-it",
} as const;

export type SupportedModel = (typeof MODEL_IDS)[keyof typeof MODEL_IDS];

export function isSupportedModel(model: string): model is SupportedModel {
  return Object.values(MODEL_IDS).includes(model as SupportedModel);
}
