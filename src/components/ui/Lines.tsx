import type { ReactNode } from "react";

type LinesProps = {
  lines: readonly string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  children?: ReactNode;
};

/**
 * A headline split into masked lines. Each line clips its own inner span, so
 * motion can raise the words into place without touching layout.
 */
export function Lines({ lines, as: Tag = "h2", className = "", id, children }: LinesProps) {
  return (
    <Tag id={id} className={className}>
      {lines.map((line, i) => (
        <span className="line" key={line}>
          <span className="line-inner">
            {line}
            {i < lines.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
      {children}
    </Tag>
  );
}
