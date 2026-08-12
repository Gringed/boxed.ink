import React from "react";

// Renders the tiny markup the changelog entries use: **bold** and *italic*.
// Split-and-map rather than dangerouslySetInnerHTML — the copy is ours, but
// there's no reason to open an HTML injection path for two formatting marks.
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

export const ChangelogText = ({ children }: { children: string }) => (
  <>
    {children.split(TOKEN).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={index} className="font-semibold">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <i key={index}>{part.slice(1, -1)}</i>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    })}
  </>
);
