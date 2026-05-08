"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveSession, type AuthSession } from "@/lib/auth";

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const body =
      mode === "register"
        ? {
            name: form.get("displayName"),
            email: form.get("email"),
            password: form.get("password"),
          }
        : {
            email: form.get("email"),
            password: form.get("password"),
          };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5250"}/api/auth/${mode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      saveSession((await response.json()) as AuthSession);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      {mode === "register" && (
        <div className="field">
          <label htmlFor="displayName">Display name</label>
          <input id="displayName" name="displayName" autoComplete="name" required />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="button" disabled={loading} type="submit">
        {loading ? "Please wait" : mode === "login" ? "Login" : "Register"}
      </button>
      <div className="link-row">
        {mode === "login" ? (
          <>
            <span>Need an account?</span>
            <Link href="/register">Register</Link>
          </>
        ) : (
          <>
            <span>Already registered?</span>
            <Link href="/login">Login</Link>
          </>
        )}
      </div>
    </form>
  );
}
