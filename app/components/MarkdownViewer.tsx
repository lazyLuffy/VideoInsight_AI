'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  onSeekTimestamp?: (seconds: number) => void;
}

// Convert "01:23" or "01:05:23" into seconds
function parseTimestampToSeconds(ts: string): number {
  const parts = ts.replace(/[[\]()]/g, '').split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export default function MarkdownViewer({ content, onSeekTimestamp }: MarkdownViewerProps) {
  if (!content) return null;

  // Split lines while keeping track of code blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  function renderInlineFormatting(text: string): React.ReactNode[] {
    const regex = /(\[(?:\d{1,2}:)?\d{1,2}:\d{2}\]|\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Timestamp [MM:SS] or [HH:MM:SS]
      const tsMatch = part.match(/^\[((?:\d{1,2}:)?\d{1,2}:\d{2})\]$/);
      if (tsMatch) {
        const rawTs = tsMatch[1];
        const seconds = parseTimestampToSeconds(rawTs);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSeekTimestamp?.(seconds)}
            className="inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white font-mono text-xs font-semibold shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer align-baseline group"
            title={`Jump to ${rawTs}`}
          >
            <Play className="h-2.5 w-2.5 fill-current text-current group-hover:scale-110 transition-transform" />
            <span>{rawTs}</span>
          </button>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-neutral-900 dark:text-neutral-100">{part.slice(2, -2)}</strong>;
      }

      // Inline code `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-xs text-red-600 dark:text-red-400 border border-neutral-200 dark:border-neutral-700">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-neutral-800 dark:text-neutral-200">{part.slice(1, -1)}</em>;
      }

      return <span key={index}>{part}</span>;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start / end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-4 overflow-hidden rounded-xl bg-neutral-900 dark:bg-[#121212] border border-neutral-800 dark:border-neutral-800 text-neutral-100 text-xs shadow-md">
            {codeBlockLang && (
              <div className="bg-neutral-800 px-4 py-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider border-b border-neutral-700/60">
                {codeBlockLang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto font-mono leading-relaxed">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-t border-neutral-200 dark:border-neutral-800" />);
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-6 mb-3 text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight pb-2 border-b border-neutral-200 dark:border-neutral-800">
          {renderInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-5 mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
          {renderInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-base font-semibold text-neutral-800 dark:text-neutral-200">
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-3 border-l-4 border-red-600 bg-red-50/60 dark:bg-red-950/30 px-4 py-2 italic text-neutral-800 dark:text-neutral-200 rounded-r-lg text-sm">
          {renderInlineFormatting(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or * or •)
    const listMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
    if (listMatch) {
      elements.push(
        <li key={`li-${i}`} className="ml-5 my-1.5 list-disc text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed marker:text-red-600 dark:marker:text-red-500">
          {renderInlineFormatting(listMatch[3])}
        </li>
      );
      continue;
    }

    // Ordered List (1. )
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <li key={`ol-${i}`} className="ml-5 my-1.5 list-decimal text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed marker:font-semibold marker:text-red-600 dark:marker:text-red-500">
          {renderInlineFormatting(numMatch[3])}
        </li>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  return <div className="markdown-content text-left">{elements}</div>;
}
