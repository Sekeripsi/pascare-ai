"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo } from "react";

import { cn } from "@/lib/utils";

/**
 * Markdown renderer for assistant answers, styled in the dokumen-bawaan
 * system: Bricolage headings, STIX prose (inherited from the turn body),
 * dotted-underline links, ledger tables.
 */
export const ChatMarkdown = memo(function ChatMarkdown({
  children,
}: {
  children: string;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ className: c, ...props }) => (
          <h1
            className={cn(
              "mt-5 mb-2 scroll-m-20 font-display text-xl font-bold tracking-tight text-ink first:mt-0 last:mb-0",
              c,
            )}
            {...props}
          />
        ),
        h2: ({ className: c, ...props }) => (
          <h2
            className={cn(
              "mt-5 mb-2 scroll-m-20 font-display text-lg font-bold tracking-tight text-ink first:mt-0 last:mb-0",
              c,
            )}
            {...props}
          />
        ),
        h3: ({ className: c, ...props }) => (
          <h3
            className={cn(
              "mt-4 mb-1.5 scroll-m-20 font-display text-base font-semibold tracking-tight text-ink first:mt-0 last:mb-0",
              c,
            )}
            {...props}
          />
        ),
        h4: ({ className: c, ...props }) => (
          <h4
            className={cn(
              "mt-3.5 mb-1 scroll-m-20 text-base font-semibold first:mt-0 last:mb-0",
              c,
            )}
            {...props}
          />
        ),
        h5: ({ className: c, ...props }) => (
          <h5
            className={cn("mt-3 mb-1 text-sm font-semibold", c)}
            {...props}
          />
        ),
        h6: ({ className: c, ...props }) => (
          <h6 className={cn("mt-3 mb-1 text-sm font-medium", c)} {...props} />
        ),
        p: ({ className: c, ...props }) => (
          <p className={cn("my-3 leading-relaxed first:mt-0 last:mb-0", c)} {...props} />
        ),
        a: ({ className: c, ...props }) => (
          <a
            className={cn(
              "font-medium text-stamp-deep underline decoration-dotted underline-offset-2 transition-colors hover:text-stamp",
              c,
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        blockquote: ({ className: c, ...props }) => (
          <blockquote
            className={cn("my-3 border-s-2 border-ink/20 ps-4 text-ink-soft", c)}
            {...props}
          />
        ),
        ul: ({ className: c, ...props }) => (
          <ul
            className={cn(
              "marker:text-ink-soft/70 my-3 ms-5 list-disc space-y-1 [&>li]:mt-1",
              c,
            )}
            {...props}
          />
        ),
        ol: ({ className: c, ...props }) => (
          <ol
            className={cn(
              "marker:text-ink-soft/70 my-3 ms-5 list-decimal [&>li]:mt-1",
              c,
            )}
            {...props}
          />
        ),
        li: ({ className: c, ...props }) => (
          <li className={cn("leading-relaxed", c)} {...props} />
        ),
        hr: ({ className: c, ...props }) => (
          <hr className={cn("my-4 border-ink/15", c)} {...props} />
        ),
        strong: ({ className: c, ...props }) => (
          <strong className={cn("font-semibold", c)} {...props} />
        ),
        table: ({ className: c, ...props }) => (
          <div className="my-3 overflow-x-auto">
            <table
              className={cn("w-full border-separate border-spacing-0 text-sm", c)}
              {...props}
            />
          </div>
        ),
        th: ({ className: c, ...props }) => (
          <th
            className={cn(
              "bg-muted border-y border-ink/20 px-3 py-1.5 text-start font-medium first:rounded-ss-lg first:border-s last:border-e [[align=center]]:text-center [[align=right]]:text-right",
              c,
            )}
            {...props}
          />
        ),
        td: ({ className: c, ...props }) => (
          <td
            className={cn(
              "border-b border-s border-ink/15 px-3 py-1.5 text-start align-top first:border-s last:border-e [[align=center]]:text-center [[align=right]]:text-right",
              c,
            )}
            {...props}
          />
        ),
        tr: ({ className: c, ...props }) => (
          <tr
            className={cn(
              "[&:last-child>td:first-child]:rounded-es-lg [&:last-child>td:last-child]:rounded-ee-lg",
              c,
            )}
            {...props}
          />
        ),
        pre: ({ className: c, ...props }) => (
          <pre
            className={cn(
              "bg-muted overflow-x-auto rounded-lg border border-ink/15 p-3 font-code text-[13px] leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[inherit]",
              c,
            )}
            {...props}
          />
        ),
        code: ({ className: c, ...props }) => (
          <code
            className={cn(
              "bg-muted rounded-md px-1.5 py-0.5 font-code text-[0.85em]",
              c,
            )}
            {...props}
          />
        ),
      }}
    >
      {children}
    </Markdown>
  );
});
