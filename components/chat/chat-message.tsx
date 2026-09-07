"use client";

import Image from "next/image";
import { memo, useState } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  LoaderIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react";
import type {
  DynamicToolUIPart,
  ToolUIPart,
  UIMessage,
} from "ai";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { cn } from "@/lib/utils";

/* ── User message: a filled-in ink slip, right-aligned ─────────── */

export const UserMessage = memo(function UserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("\n");

  return (
    <div className="flex justify-end px-2">
      <div className="max-w-[85%] rounded-xl rounded-ee-sm bg-ink px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words text-paper shadow-[2px_3px_0_-1px_rgba(23,51,74,.3)]">
        {text}
      </div>
    </div>
  );
});

/* ── Assistant message: typed straight onto the consultation sheet ── */

type AssistantMessageProps = {
  message: UIMessage;
  /** Only the last answer offers "jawab ulang". */
  isLast: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
  /** True while this answer is still arriving — rides the typewriter caret. */
  streaming?: boolean;
};

export const AssistantMessage = memo(function AssistantMessage({
  message,
  isLast,
  canRegenerate,
  onRegenerate,
  streaming = false,
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

  const copy = () => {
    if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      },
      () => { },
    );
  };

  return (
    <article data-role="assistant" className="animate-in fade-in slide-in-from-bottom-1 duration-150">
      <header className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full border border-ink/25 bg-paper-card shadow-[1px_2px_0_0_rgba(23,51,74,.1)]"
        >
          <Image
            src="/postvisit.svg"
            alt=""
            width={16}
            height={16}
            className="size-4"
            unoptimized
          />
        </span>
        <span className="font-code text-[10px] font-semibold tracking-[.18em] text-ink-soft uppercase">
          Pascare.ai
        </span>
      </header>

      {/* Open prose on the paper ground — no bubble. */}
      <div className="mt-3 ps-0.5 font-body text-[15.5px] leading-[1.75] break-words text-ink">
        {message.parts.map((part, i) => (
          <AssistantPart key={i} part={part} />
        ))}
        {streaming && text && (
          <span
            aria-hidden
            className="pv-caret ml-px inline-block h-[1.05em] w-[0.55ch] translate-y-[0.15em] bg-stamp"
          />
        )}
      </div>

      {(isLast || copied) && (
        <div className="mt-1 -ms-1 flex items-center gap-0.5">
          {text && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Tersalin" : "Salin jawaban"}
              title={copied ? "Tersalin" : "Salin jawaban"}
              className="grid size-7 place-items-center rounded-md text-ink-soft opacity-70 transition-all hover:bg-ink/[.05] hover:text-ink hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {copied ? (
                <CheckIcon className="size-3.5 text-sah" strokeWidth={2.5} />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </button>
          )}
          {isLast && canRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              aria-label="Jawab ulang"
              title="Jawab ulang"
              className="grid size-7 place-items-center rounded-md text-ink-soft opacity-70 transition-all hover:bg-ink/[.05] hover:text-ink hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <RefreshCwIcon className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </article>
  );
});

/* ── Part dispatch ─────────────────────────────────────────────── */

function AssistantPart({ part }: { part: UIMessage["parts"][number] }) {
  switch (part.type) {
    case "text":
      return part.text ? (
        <ChatMarkdown>{part.text}</ChatMarkdown>
      ) : null;
    case "reasoning":
      return <ReasoningDisclosure text={part.text} />;
    case "dynamic-tool":
      return (
        <ToolDisclosure
          toolName={part.toolName}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      );
    default:
      // Typed tool parts ("tool-<name>") and ignored pass-throughs.
      if (typeof part.type === "string" && part.type.startsWith("tool-")) {
        const tool = part as ToolUIPart;
        return (
          <ToolDisclosure
            toolName={part.type.slice("tool-".length)}
            state={tool.state}
            input={tool.input}
            output={tool.output}
            errorText={tool.errorText}
          />
        );
      }
      return null;
  }
}

/* ── Reasoning: a margin note, collapsed by default ────────────── */

function ReasoningDisclosure({ text }: { text: string }) {
  if (!text) return null;
  return (
    <details className="group/reasoning my-2">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md py-0.5 font-code text-[10px] font-semibold tracking-[.14em] text-ink-soft uppercase transition-colors select-none hover:text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        <ChevronRightIcon
          className="size-3 transition-transform group-open/reasoning:rotate-90"
          strokeWidth={2.5}
        />
        Proses penalaran
      </summary>
      <p className="mt-2 border-s-2 border-dashed border-ink/20 ps-4 font-body text-sm leading-relaxed whitespace-pre-wrap text-ink-soft italic">
        {text}
      </p>
    </details>
  );
}

/* ── Tools: ledger entries of what the clerk looked up ─────────── */

const TOOL_STATE_ICON = {
  "input-streaming": LoaderIcon,
  "input-available": LoaderIcon,
  "output-available": CheckIcon,
  "output-error": XCircleIcon,
} as const;

function humanizeToolName(name: string): string {
  return name.replace(/[-_]+/g, " ").trim();
}

function ToolDisclosure({
  toolName,
  state,
  input,
  output,
  errorText,
}: Pick<DynamicToolUIPart, "toolName" | "state" | "input" | "output" | "errorText">) {
  const running =
    state === "input-streaming" || state === "input-available";

  const Icon = TOOL_STATE_ICON[state as keyof typeof TOOL_STATE_ICON] ?? CheckIcon;
  const isError = state === "output-error";

  return (
    <details className="group/tool my-2">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md py-0.5 font-code text-[10px] font-semibold tracking-[.14em] uppercase transition-colors select-none hover:text-ink open:text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        <Icon
          className={cn(
            "size-3 shrink-0",
            running && "animate-spin [animation-duration:.8s]",
            !isError && !running && "text-sah",
            isError && "text-stamp-deep",
          )}
          strokeWidth={2.5}
        />
        <span className={cn(running ? "text-ink-soft" : "text-muted-foreground")}>
          Memeriksa: <span className="normal-case">{humanizeToolName(toolName)}</span>
        </span>
        <ChevronRightIcon
          className="size-3 text-ink-soft transition-transform group-open/tool:rotate-90"
          strokeWidth={2.5}
        />
      </summary>

      <div className="mt-2 space-y-2 ps-5">
        {input != null && Object.keys(input).length > 0 && (
          <pre className="bg-muted overflow-x-auto rounded-lg p-2.5 font-code text-xs whitespace-pre-wrap">
            {JSON.stringify(input, null, 2)}
          </pre>
        )}
        {isError && errorText && (
          <pre className="overflow-x-auto rounded-lg border border-stamp/30 bg-stamp/[.06] p-2.5 font-code text-xs whitespace-pre-wrap text-stamp-deep">
            {errorText}
          </pre>
        )}
        {!isError && output != null && (
          <pre className="bg-muted max-h-64 overflow-auto rounded-lg p-2.5 font-code text-xs whitespace-pre-wrap">
            {typeof output === "string"
              ? output
              : JSON.stringify(output, null, 2)}
          </pre>
        )}
      </div>
    </details>
  );
}

/* ── Waiting indicator: three ink dots before the first token ──── */

export function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Asisten sedang menulis jawaban"
      className="animate-in fade-in flex items-center gap-2.5 px-2"
    >
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-full border border-ink/25 bg-paper-card shadow-[1px_2px_0_0_rgba(23,51,74,.1)]"
      >
        <Image
          src="/postvisit.svg"
          alt=""
          width={16}
          height={16}
          className="size-4"
          unoptimized
        />
      </span>
      <span aria-hidden className="flex items-center gap-1 pt-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="pv-dot size-1.5 rounded-full bg-ink/60"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * True when the thread shows the dots: request sent but nothing readable
 * has arrived yet (no text or reasoning anywhere in the last message).
 */
export function isWaitingForFirstToken(message: UIMessage): boolean {
  return !message.parts.some(
    (p) =>
      (p.type === "text" || p.type === "reasoning") && p.text.length > 0,
  );
}
