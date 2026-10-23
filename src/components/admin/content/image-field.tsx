"use client";

import { useRef, useState, useTransition } from "react";
import NextImage from "next/image";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Input, MicroLabel } from "@/components/admin/ui/primitives";
import { uploadMedia } from "@/server/actions/media";

/**
 * Image picker. Uploads through the media Server Action, which validates the
 * type and size and records the result, then hands back a public URL. The
 * URL is also editable by hand, because an image that already lives in
 * /public does not need uploading.
 */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  /** Shown under the preview, e.g. "1200x630 renders best". */
  recommendation,
  /**
   * What the site uses when the field is left empty. Given one, the thumbnail
   * shows that image instead of an empty frame: a blank box next to a field
   * that says the image is generated for you reads as something broken, and
   * the whole point of the OG card is that you can see it before you share it.
   */
  fallbackSrc,
  fallbackNote,
  error,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  recommendation?: string;
  fallbackSrc?: string;
  fallbackNote?: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const own = Boolean(value) && !failed;
  const preview = own ? value : (fallbackSrc ?? "");

  function handleFile(file: File) {
    const data = new FormData();
    data.set("file", file);
    data.set("alt", label);

    startTransition(async () => {
      const result = await uploadMedia(data);
      if (result.ok && result.data) {
        onChange(result.data.url);
        setFailed(false);
        toast.success("Image uploaded.");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div>
      <Field label={label} hint={hint} error={error}>
        {(id) => (
          <Input
            id={id}
            value={value}
            placeholder="/hero-bg.webp or https://..."
            onChange={(event) => {
              setFailed(false);
              onChange(event.target.value);
            }}
          />
        )}
      </Field>

      <div className="-mt-3 flex flex-wrap items-center gap-3">
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
          {preview ? (
            <NextImage
              src={preview}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
              onError={own ? () => setFailed(true) : undefined}
              unoptimized={!own || preview.startsWith("http")}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-slate-600">
              <ImageIcon size={18} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
              className="sr-only"
              aria-label={`Upload ${label}`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
                event.target.value = "";
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {pending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              Upload
            </Button>
            {value ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                aria-label={`Remove ${label}`}
              >
                <Trash2 size={13} /> Remove
              </Button>
            ) : null}
          </div>
          {!own && fallbackNote ? (
            <MicroLabel>{fallbackNote}</MicroLabel>
          ) : recommendation ? (
            <MicroLabel>{recommendation}</MicroLabel>
          ) : null}
          {failed && value ? (
            <span className="text-xs text-amber-300">
              That URL did not load. Check the path.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
