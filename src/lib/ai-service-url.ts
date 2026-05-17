const developmentAiServiceUrl = "http://127.0.0.1:8001";
const productionAiServiceUrl = "https://erp-ai-service-48iy.onrender.com";

export function getAiServiceUrl() {
  const configuredUrl = (process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? process.env.AI_SERVICE_URL)?.trim();
  const baseUrl = configuredUrl || (process.env.NODE_ENV === "production" ? productionAiServiceUrl : developmentAiServiceUrl);

  return baseUrl.replace(/\/+$/, "");
}
