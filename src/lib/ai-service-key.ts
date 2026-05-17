const defaultAiServiceKey = "dev-internal-ai-key-change-me";

export function getAiServiceKey() {
  return process.env.AI_SERVICE_API_KEY?.trim() || defaultAiServiceKey;
}
