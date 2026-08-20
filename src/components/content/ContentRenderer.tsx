import type { ReactNode } from "react";

/**
 * Renders stored article/description text as safe React elements.
 *
 * Content is plain strings today (no rich-text editor exists yet), so this
 * supports a small, safe Markdown-like subset by hand rather than pulling in
 * a full Markdown toolchain: headings, paragraphs, bold/italic, inline code,
 * fenced code blocks, blockquotes, ordered/unordered lists, tables, links,
 * and images. Text is always passed through JSX interpolation (never
 * `dangerouslySetInnerHTML`), and links/images only match http(s) URLs, so
 * there is no HTML/script injection surface.
 */
export function ContentRenderer({ content }: { content: string }) {
  return <div className="flex flex-col gap-4">{renderBlocks(content)}</div>;
}

const HEADING_TAGS = ["h2", "h3", "h4", "h5", "h6", "h6"] as const;
const HEADING_CLASSES = "font-semibold tracking-tight text-zinc-950 dark:text-zinc-50";

const FENCE_RE = /^```(\w*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const QUOTE_RE = /^>\s?/;
const UL_RE = /^[-*]\s+/;
const OL_RE = /^\d+\.\s+/;
const TABLE_ROW_RE = /^\|.*\|\s*$/;
const TABLE_SEPARATOR_RE = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

function isBlockStart(line: string): boolean {
  return (
    line.trim() === "" ||
    FENCE_RE.test(line) ||
    HEADING_RE.test(line) ||
    QUOTE_RE.test(line) ||
    UL_RE.test(line) ||
    OL_RE.test(line) ||
    TABLE_ROW_RE.test(line)
  );
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const fenceMatch = FENCE_RE.exec(line);
    if (fenceMatch) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-md bg-zinc-900 p-4 text-sm leading-6 text-zinc-100 dark:bg-black"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = HEADING_TAGS[level - 1];
      blocks.push(
        <Tag key={key++} className={HEADING_CLASSES}>
          {parseInline(headingMatch[2])}
        </Tag>
      );
      i++;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        quoteLines.push(lines[i].replace(QUOTE_RE, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-zinc-300 pl-4 text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400"
        >
          {parseInline(quoteLines.join(" "))}
        </blockquote>
      );
      continue;
    }

    if (UL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UL_RE.test(lines[i])) {
        items.push(lines[i].replace(UL_RE, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1 pl-6">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (OL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OL_RE.test(lines[i])) {
        items.push(lines[i].replace(OL_RE, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1 pl-6">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (
      TABLE_ROW_RE.test(line) &&
      i + 1 < lines.length &&
      TABLE_SEPARATOR_RE.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      const header = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && TABLE_ROW_RE.test(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {header.map((cell, idx) => (
                  <th
                    key={idx}
                    className="border-b border-zinc-300 px-3 py-2 text-left font-semibold dark:border-zinc-700"
                  >
                    {parseInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800"
                    >
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && !isBlockStart(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="leading-7 text-zinc-700 dark:text-zinc-300">
        {parseInline(paraLines.join(" "))}
      </p>
    );
  }

  return blocks;
}

interface InlinePattern {
  regex: RegExp;
  render: (match: RegExpExecArray, key: string) => ReactNode;
}

const INLINE_PATTERNS: InlinePattern[] = [
  {
    regex: /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/,
    render: (m, key) => (
      // eslint-disable-next-line @next/next/no-img-element -- content images come from arbitrary external URLs
      <img key={key} src={m[2]} alt={m[1]} className="rounded-md" loading="lazy" />
    ),
  },
  {
    regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/,
    render: (m, key) => (
      <a
        key={key}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400"
      >
        {m[1]}
      </a>
    ),
  },
  {
    regex: /`([^`]+)`/,
    render: (m, key) => (
      <code
        key={key}
        className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.9em] dark:bg-zinc-800"
      >
        {m[1]}
      </code>
    ),
  },
  {
    regex: /\*\*([^*]+)\*\*/,
    render: (m, key) => <strong key={key}>{parseInline(m[1])}</strong>,
  },
  {
    regex: /\*([^*]+)\*/,
    render: (m, key) => <em key={key}>{parseInline(m[1])}</em>,
  },
];

function parseInline(text: string, keyPrefix = "i"): ReactNode[] {
  if (!text) {
    return [];
  }

  let earliestIndex = -1;
  let earliestPattern: InlinePattern | null = null;
  let earliestMatch: RegExpExecArray | null = null;

  for (const pattern of INLINE_PATTERNS) {
    const match = new RegExp(pattern.regex.source).exec(text);
    if (match && (earliestIndex === -1 || match.index < earliestIndex)) {
      earliestIndex = match.index;
      earliestPattern = pattern;
      earliestMatch = match;
    }
  }

  if (!earliestMatch || !earliestPattern) {
    return [text];
  }

  const before = text.slice(0, earliestIndex);
  const after = text.slice(earliestIndex + earliestMatch[0].length);
  const nodes: ReactNode[] = [];

  if (before) {
    nodes.push(before);
  }
  nodes.push(earliestPattern.render(earliestMatch, `${keyPrefix}-${earliestIndex}`));
  nodes.push(...parseInline(after, `${keyPrefix}-${earliestIndex}-n`));

  return nodes;
}
