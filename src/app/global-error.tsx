"use client";

/**
 * Catches throws in the root layout, which error.tsx cannot reach.
 *
 * This file replaces the root layout when active, so it must render its own
 * <html>/<body> — and global CSS does NOT load here, which is why every style
 * below is inline rather than a Tailwind class.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const digest =
    error instanceof Error && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#07090e",
          color: "#f1f5f9",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <title>Something went wrong — Klixora</title>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#22d3ee",
          }}
        >
          {"// Critical error"}
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.75rem, 5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          The page could not load
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "28rem",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            color: "#94a3b8",
          }}
        >
          Something failed before the site could start. Trying again usually
          fixes it — if it does not, email{" "}
          <a href="mailto:Info@Klixora.site" style={{ color: "#22d3ee" }}>
            Info@Klixora.site
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            marginTop: "1rem",
            cursor: "pointer",
            border: "none",
            borderRadius: "9999px",
            padding: "1rem 2rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#07090e",
            backgroundImage: "linear-gradient(90deg, #22d3ee, #8b5cf6)",
          }}
        >
          Try again
        </button>
        {digest ? (
          <p
            style={{
              margin: 0,
              fontSize: "0.625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Reference {digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
