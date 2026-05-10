import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8001";
  const aiServiceKey = process.env.AI_SERVICE_API_KEY;
  const authorization = request.headers.get("authorization");
  const body = await request.text();

  if (!authorization) {
    return NextResponse.json({ detail: "Missing ERP authorization token." }, { status: 401 });
  }

  const response = await fetch(`${aiServiceUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      ...(aiServiceKey ? { "X-AI-Service-Key": aiServiceKey } : {}),
    },
    body,
  });

  const payload = await response.text();
  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
