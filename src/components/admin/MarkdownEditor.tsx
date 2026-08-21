"use client";

import { useRef, useState } from "react";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { inputClasses, cn } from "@/lib/styles";

interface ToolbarAction {
  label: string;
  title: string;
  apply: (selected: string) => { text: string; cursorOffset?: number };
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "H2", title: "Heading", apply: (s) => ({ text: `## ${s || "Heading"}` }) },
  { label: "B", title: "Bold", apply: (s) => ({ text: `**${s || "bold text"}**` }) },
  { label: "I", title: "Italic", apply: (s) => ({ text: `*${s || "italic text"}*` }) },
  {
    label: "Link",
    title: "Link",
    apply: (s) => ({ text: `[${s || "link text"}](https://example.com)` }),
  },
  {
    label: "Image",
    title: "Image",
    apply: (s) => ({ text: `![${s || "alt text"}](https://example.com/image.jpg)` }),
  },
  { label: "••", title: "Bulleted list", apply: (s) => ({ text: `- ${s || "list item"}` }) },
  { label: "1.", title: "Numbered list", apply: (s) => ({ text: `1. ${s || "list item"}` }) },
  { label: "“", title: "Blockquote", apply: (s) => ({ text: `> ${s || "quote"}` }) },
  { label: "`", title: "Inline code", apply: (s) => ({ text: `\`${s || "code"}\`` }) },
  {
    label: "```",
    title: "Code block",
    apply: (s) => ({ text: "```\n" + (s || "code") + "\n```" }),
  },
  {
    label: "Table",
    title: "Table",
    apply: () => ({
      text: "| Column A | Column B |\n| --- | --- |\n| Value | Value |",
    }),
  },
];

export function MarkdownEditor({
  name,
  defaultValue,
  rows = 20,
}: {
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: ToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const { text } = action.apply(selected);
    const nextValue = value.slice(0, start) + text + value.slice(end);

    setValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Formatting">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.title}
              type="button"
              title={action.title}
              aria-label={action.title}
              onClick={() => applyAction(action)}
              disabled={tab === "preview"}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-md border border-zinc-300 p-0.5 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium",
              tab === "write"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium",
              tab === "preview"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* The textarea stays mounted (just hidden) in Preview mode so its value is always part of the submitted form. */}
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={rows}
        required
        className={cn(inputClasses, "font-mono text-sm", tab === "preview" && "hidden")}
      />

      {tab === "preview" && (
        <div className="rounded-md border border-zinc-300 p-4 dark:border-zinc-700">
          {value.trim() ? (
            <ContentRenderer content={value} />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
