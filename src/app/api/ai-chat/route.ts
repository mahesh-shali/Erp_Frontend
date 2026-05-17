import { NextRequest, NextResponse } from "next/server";
import { getAiServiceUrl } from "@/lib/ai-service-url";

export async function POST(request: NextRequest) {
  const aiServiceUrl = getAiServiceUrl();
  const aiServiceKey = process.env.AI_SERVICE_API_KEY;
  const authorization = request.headers.get("authorization");
  const body = await request.text();

  if (!authorization) {
    return NextResponse.json({ detail: "Missing ERP authorization token." }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${aiServiceUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        ...(aiServiceKey ? { "X-AI-Service-Key": aiServiceKey } : {}),
      },
      body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: `AI service is not reachable at ${aiServiceUrl}.`,
        error: error instanceof Error ? error.message : "Unknown network error.",
      },
      { status: 503 },
    );
  }

  const payload = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        detail: `AI service returned ${response.status} ${response.statusText} instead of JSON.`,
        upstream: payload.slice(0, 500),
      },
      { status: response.ok ? 502 : response.status },
    );
  }

  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": contentType },
  });
}
