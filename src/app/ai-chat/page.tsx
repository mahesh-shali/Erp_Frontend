"use client";

import { Bot, Database, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getSession, touchSession } from "@/lib/auth";
import { permissions } from "@/lib/permissions";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sql?: string;
};

type ChatResponse = {
  answer: string;
  sql: string;
  rows: Record<string, unknown>[];
  thread_id: string;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const payload = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      payload || `AI chat returned ${response.status} ${response.statusText}.`,
    );
  }

  const data = JSON.parse(payload) as T;
  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String(data.detail)
        : payload;
    throw new Error(detail);
  }

  return data;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about ERP data, like users by role, visible sidebar items, or recent records.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    const session = getSession();
    if (!trimmed || !session || isSending) {
      return;
    }

    setError("");
    setIsSending(true);
    setMessage("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ message: trimmed, thread_id: threadId }),
      });

      const data = await readJsonResponse<ChatResponse>(response);
      setThreadId(data.thread_id);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer, sql: data.sql },
      ]);
      touchSession();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "AI chat request failed.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AppShell title="AI Chat" permission={permissions.aiChatView}>
      <section className="ai-chat-shell">
        <div className="ai-chat-header">
          <div>
            <Bot size={22} />
            <span>Database assistant</span>
          </div>
          <Database size={20} />
        </div>

        <div className="ai-chat-messages" aria-live="polite">
          {messages.map((item, index) => (
            <article
              className={`ai-message ${item.role}`}
              key={`${item.role}-${index}`}
            >
              <p>{item.content}</p>
              {item.sql && (
                <details>
                  <summary>SQL used</summary>
                  <code>{item.sql}</code>
                </details>
              )}
            </article>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <form className="ai-chat-input" onSubmit={sendMessage}>
          <input
            aria-label="Ask ERP AI"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about your ERP database"
            value={message}
          />
          <button
            aria-label="Send message"
            disabled={isSending || !message.trim()}
            type="submit"
          >
            <Send size={18} />
          </button>
        </form>
      </section>
    </AppShell>
  );
}
