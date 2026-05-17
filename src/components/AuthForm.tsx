"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { saveSession, type AuthSession } from "@/lib/auth";
import { getApiUrl } from "@/lib/api-url";

type Props = {
  mode: "login" | "register";
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: "outline" | "filled_blue" | "filled_black";
              size: "large" | "medium" | "small";
              width?: number;
              text?: "signin_with" | "signup_with" | "continue_with";
            },
          ) => void;
        };
      };
    };
  }
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const submitGoogleCredential = useCallback(
    async (credential: string) => {
      setError("");
      setLoading(true);

      try {
        const response = await fetch(`${getApiUrl()}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        saveSession((await response.json()) as AuthSession);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google authentication failed.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }
    const clientId = googleClientId;

    function renderGoogleButton() {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google did not return a credential.");
            return;
          }

          await submitGoogleCredential(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: mode === "register" ? "signup_with" : "signin_with",
      });
    }

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, mode, submitGoogleCredential]);

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
        `${getApiUrl()}/api/auth/${mode}`,
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
      {googleClientId && (
        <>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <div className="google-button-wrap" ref={googleButtonRef} />
        </>
      )}
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
