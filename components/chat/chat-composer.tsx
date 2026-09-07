"use client";

import { useRef, useState } from "react";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import type { ChatStatus } from "ai";

import { cn } from "@/lib/utils";

const MAX_TEXTAREA_HEIGHT = 160; // px — roughly seven rows

type ComposerProps = {
  status: ChatStatus;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function ChatComposer({ status, onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const running = status === "streaming" || status === "submitted";
  // A failed request leaves the draft intact; sending again is allowed.
  const canSend = value.trim().length > 0 && !running;

  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || running) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => {
      autosize();
      textareaRef.current?.focus();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 rounded-2xl border border-ink/30 bg-paper-card p-2 shadow-[4px_5px_0_-2px_rgba(23,51,74,.09)] transition-[border-color,box-shadow] focus-within:border-ink focus-within:shadow-[6px_7px_0_-2px_rgba(23,51,74,.13)]"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autosize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Tulis pertanyaan Anda…"
        enterKeyHint="send"
        aria-label="Pertanyaan Anda"
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 font-body text-base leading-relaxed break-words text-ink caret-stamp outline-none placeholder:text-ink/40"
      />

      <div className="flex items-center pb-0.5">
        {running ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Hentikan jawaban"
            title="Hentikan jawaban"
            className="grid size-9 place-items-center rounded-xl border border-stamp-deep/30 bg-stamp text-paper-card shadow-[2px_3px_0_-1px_rgba(138,42,18,.4)] transition-all hover:bg-stamp-deep active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp-deep"
          >
            <SquareIcon className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Kirim pertanyaan"
            title="Kirim pertanyaan"
            className={cn(
              "grid size-9 place-items-center rounded-xl transition-all active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
              canSend
                ? "bg-ink text-paper-card shadow-[2px_3px_0_-1px_rgba(23,51,74,.35)] hover:bg-ink/90"
                : "cursor-not-allowed bg-ink/25 text-paper-card",
            )}
          >
            <ArrowUpIcon className="size-4.5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </form>
  );
}
