"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error || "Wrong password.");
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <Image
          src="/images/wordmark-cut.webp"
          alt="Discotecha"
          width={471}
          height={127}
          priority
          className="mx-auto mb-10 h-auto w-44"
        />
        <p className="mb-8 text-[9px] font-semibold uppercase tracking-door text-signal">
          Staff only
        </p>
        <input
          className="field mb-6 text-center"
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label="Admin password"
        />
        <button
          onClick={submit}
          disabled={busy}
          className="w-full border border-bone/25 py-4 text-[11px] font-semibold uppercase tracking-door text-bone transition-colors hover:border-signal hover:bg-signal hover:text-ink disabled:opacity-40"
        >
          {busy ? "…" : "Open the book"}
        </button>
        {error && (
          <p role="alert" className="mt-5 text-[10px] uppercase tracking-[0.18em] text-signal">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
