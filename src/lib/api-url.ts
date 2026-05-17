const developmentApiUrl = "https://localhost:5250";
const productionApiUrl = "https://erp-backend-we6v.onrender.com";

export function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = configuredUrl || (process.env.NODE_ENV === "production" ? productionApiUrl : developmentApiUrl);

  return baseUrl.replace(/\/+$/, "");
}
