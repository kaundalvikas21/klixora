import { Fragment } from "react";

/**
 * Headings are stored as one editable string with gradient words wrapped in
 * asterisks: "GROWTH *DRIVEN*". That keeps the admin field a plain text input
 * while the public heading keeps the two-tone treatment it has today.
 */
export function splitGradient(value: string) {
  return value
    .split(/(\*[^*]+\*)/g)
    .filter((part) => part.length > 0)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*") && part.length > 2
        ? { text: part.slice(1, -1), gradient: true }
        : { text: part, gradient: false },
    );
}

/** Same string with the markers removed, for counters and meta fields. */
export const plainText = (value: string) => value.replace(/\*/g, "");

export function GradientText({ value }: { value: string }) {
  return (
    <>
      {splitGradient(value).map((part, i) => (
        <Fragment key={i}>
          {part.gradient ? (
            <span className="text-gradient">{part.text}</span>
          ) : (
            part.text
          )}
        </Fragment>
      ))}
    </>
  );
}
