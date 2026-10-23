"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { MicroLabel } from "@/components/admin/ui/primitives";
import { cn } from "@/utils/cn";

/**
 * Live preview. It renders the real public section components with the draft
 * values passed as props, so there is no second implementation to drift.
 *
 * It renders them into an IFRAME, which is the part that matters.
 *
 * A scaled <div> cannot be a responsive preview. CSS media queries, `vw` and
 * `dvh` all resolve against the real browser window, not against the box you
 * drew. A 390px "mobile" frame was still matching `lg:` and still computing
 * `9vw` against a 1600px window, so the hero rendered 72px type inside a
 * 390px column and spilled out of the frame. An iframe is a real nested
 * browsing context: its viewport IS the device width, so every breakpoint,
 * viewport unit and `min-h-screen` resolves correctly for free.
 */
const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1280, height: 800 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 834, height: 1112 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390, height: 844 },
] as const;

type Device = (typeof DEVICES)[number]["id"];

/**
 * Inside the frame the operator may scroll and look, but not click. Killing
 * pointer events on the content leaves wheel and trackpad scrolling working,
 * because those target the document rather than the element under the
 * cursor, while making every control inert.
 */
const FRAME_CSS = `
  html { scrollbar-width: none; }
  html::-webkit-scrollbar { width: 0; height: 0; }
  body { margin: 0; }
  body * { pointer-events: none !important; }
`;

export function PreviewFrame({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<Device>("desktop");
  const containerRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setAvailable(entry?.contentRect.width ?? 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /**
   * The iframe starts with an empty document, so it needs the app's styles
   * copied in, and the font variables that live as classes on <html>. The
   * observer keeps up with the <style> tags Next injects during development.
   */
  const attach = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) {
      setBody(null);
      return;
    }

    const wire = () => {
      const doc = frame.contentDocument;
      if (!doc) return;

      doc.documentElement.className = document.documentElement.className;

      const sync = () => {
        const want = [
          ...document.querySelectorAll<HTMLElement>(
            'link[rel="stylesheet"], style',
          ),
        ];
        // Cheap identity check, so the observer is not re-cloning the whole
        // stylesheet set on every unrelated head mutation.
        const have = doc.head.querySelectorAll("[data-preview-style]").length;
        if (have === want.length) return;

        doc.head.querySelectorAll("[data-preview-style]").forEach((n) => n.remove());
        for (const node of want) {
          const clone = node.cloneNode(true) as HTMLElement;
          clone.setAttribute("data-preview-style", "");
          doc.head.appendChild(clone);
        }
      };

      sync();

      const own = doc.createElement("style");
      own.textContent = FRAME_CSS;
      doc.head.appendChild(own);

      const observer = new MutationObserver(sync);
      observer.observe(document.head, { childList: true });

      setBody(doc.body);
    };

    if (frame.contentDocument?.readyState === "complete") wire();
    else frame.addEventListener("load", wire, { once: true });
  }, []);

  const spec = DEVICES.find((option) => option.id === device)!;
  // Never upscale: a phone preview blown up to fill the column would be a
  // lie about how big the type is.
  const scale = available > 0 ? Math.min(1, available / spec.width) : 0.5;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MicroLabel>Live preview</MicroLabel>
        <div
          role="group"
          aria-label="Preview width"
          className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
        >
          {DEVICES.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={device === option.id}
                aria-label={option.label}
                title={`${option.label} (${option.width}x${option.height})`}
                onClick={() => setDevice(option.id)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                  device === option.id
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                <Icon size={14} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <div ref={containerRef} className="min-w-0">
        {/* The device sits centred, so a narrow phone preview is not pinned
            to one edge of a wide column. The outer box takes the scaled
            height so the panel below it never jumps when the device
            changes. */}
        <div
          className="mx-auto overflow-hidden rounded-xl border border-white/10 bg-ink"
          style={{
            width: Math.round(spec.width * scale),
            height: Math.round(spec.height * scale),
          }}
        >
          <iframe
            ref={attach}
            title="Live preview of the public section"
            // Out of the tab order: the preview is for looking at, and its
            // controls are inert.
            tabIndex={-1}
            style={{
              width: spec.width,
              height: spec.height,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
          {body ? createPortal(children, body) : null}
        </div>
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {spec.width}x{spec.height} at {Math.round(scale * 100)}% · real section
        components · scroll inside the frame
      </p>
    </div>
  );
}
