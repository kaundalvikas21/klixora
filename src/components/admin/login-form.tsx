"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Field, Input, PasswordInput } from "@/components/admin/ui/primitives";
import { signInWithPassword } from "@/server/actions/auth";

/**
 * Credentials sign-in.
 *
 * The CTA is the site's own gradient pill rather than an admin button, so
 * the login screen reads as part of the product and not as a tool bolted on
 * beside it.
 */
export function LoginForm({
  next,
  initialError,
  configured,
}: {
  next: string;
  initialError?: string;
  configured: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    try {
      const result = await signInWithPassword(email, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (cause) {
      console.error("[login]", cause);
      setError("Sign in failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    // method="post" matters even though handleSubmit preventDefaults: a
    // submit that lands before hydration falls back to the form's own
    // method, and a form with no method is a GET, which puts the password
    // in the URL, in history and in every log between here and the server.
    <form method="post" onSubmit={handleSubmit} className="mt-6 flex flex-col gap-1">
      {!configured ? (
        <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
          Supabase is not configured. Run{" "}
          <code className="font-mono">npm run db:start</code>, copy the keys
          into <code className="font-mono">.env.local</code>, then{" "}
          <code className="font-mono">npm run db:admin</code>.
        </p>
      ) : null}

      <Field label="Email">
        {(id) => (
          <Input
            id={id}
            type="email"
            name="email"
            autoComplete="username"
            placeholder="admin@klixora.site"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field label="Password" error={error}>
        {(id) => (
          <PasswordInput
            id={id}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-display text-xs font-bold uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:shadow-glow-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : null}
        Sign in
      </button>
    </form>
  );
}
