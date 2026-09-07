"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import {
  AlertCircleIcon,
  ArrowDownIcon,
  CrossIcon,
} from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import {
  AssistantMessage,
  TypingIndicator,
  UserMessage,
  isWaitingForFirstToken,
} from "@/components/chat/chat-message";
import { cn } from "@/lib/utils";

/** Opening prompts on an empty sheet — post-visit staples. */
const STARTERS = [
  "Obat apa saja yang perlu saya minum hari ini?",
  "Kapan jadwal kontrol berikutnya?",
  "Pola makan apa yang sebaiknya saya jalani?",
  "Efek samping apa yang perlu diwaspadai?",
];

/** A request is live from send until the stream closes or fails. */
const isRunning = (status: string) =>
  status === "submitted" || status === "streaming";

export function ChatRoom({ token }: { token?: string }) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        ...(token ? { body: { token } } : {}),
      }),
    [token],
  );

  const { messages, sendMessage, regenerate, stop, status, error, clearError } =
    useChat({
      transport,
      // Keep agent loops going when the backend pauses mid tool-call chain,
      // same contract the prebuilt runtime used.
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

  /* ── Scroll: stick to the newest entry unless the reader scrolls up ── */
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const scrollToBottom = useCallback((smooth: boolean) => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pinnedRef.current) scrollToBottom(false);
  }, [messages, status, scrollToBottom]);

  const handleViewportScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
    pinnedRef.current = atBottom;
    setShowJump(!atBottom);
  };

  const handleSend = useCallback(
    (text: string) => {
      pinnedRef.current = true;
      setShowJump(false);
      sendMessage({ text });
    },
    [sendMessage],
  );

  const handleRetry = useCallback(() => {
    clearError();
    regenerate();
    pinnedRef.current = true;
  }, [clearError, regenerate]);

  /* ── Derived view state ─────────────────────────────────────────── */
  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  const lastIsAssistant = lastMessage?.role === "assistant";
  const running = isRunning(status);

  const waitingForFirstToken =
    status === "submitted" ||
    (status === "streaming" &&
      lastIsAssistant &&
      isWaitingForFirstToken(lastMessage as UIMessage));

  const followUps =
    status === "ready" ? extractSuggestions(lastMessage) : [];

  return (
    <div className="postvisit-chat-shell flex h-dvh flex-col">
      <ChatHeader token={token} />

      <div
        ref={viewportRef}
        onScroll={handleViewportScroll}
        className="min-h-0 flex-1 overflow-y-auto"
        aria-live="polite"
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 pt-6 pb-6 sm:px-6",
            isEmpty && "min-h-full justify-center pb-12 sm:pb-24",
          )}
        >
          {isEmpty ? (
            <ThreadWelcome onStarter={handleSend} />
          ) : (
            <>
              {messages.map((message, i) => {
                const isLast = i === messages.length - 1;
                if (message.role === "user") {
                  return <UserMessage key={message.id} message={message} />;
                }
                const streaming = isLast && status === "streaming";
                return (
                  <AssistantMessage
                    key={message.id}
                    message={message}
                    isLast={isLast}
                    canRegenerate={isLast && !running}
                    onRegenerate={handleRetry}
                    streaming={streaming}
                  />
                );
              })}
              {waitingForFirstToken && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Docked desk: suggestions, errors, composer, emergency note */}
      <div className="shrink-0">
        <div className="relative mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6 md:pb-5">
          {showJump && (
            <button
              type="button"
              onClick={() => {
                pinnedRef.current = true;
                setShowJump(false);
                scrollToBottom(true);
              }}
              aria-label="Gulir ke pesan terbaru"
              title="Gulir ke pesan terbaru"
              className="absolute -top-12 left-1/2 z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-ink/25 bg-paper-card p-2.5 text-ink-soft shadow-[2px_3px_0_-1px_rgba(23,51,74,.12)] transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <ArrowDownIcon className="size-4" />
            </button>
          )}

          {followUps.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
              {followUps.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-lg border border-ink/20 bg-paper-card px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-[13px] text-ink shadow-[2px_3px_0_-1px_rgba(23,51,74,.05)] transition-all hover:-translate-y-px hover:border-ink/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-2 flex items-start gap-2.5 rounded-xl border border-stamp/35 bg-stamp/[.06] px-3.5 py-2.5"
            >
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-stamp-deep" />
              <div className="min-w-0 flex-1">
                <p className="font-code text-[10px] font-semibold uppercase tracking-[.14em] text-stamp-deep">
                  Pesan gagal terkirim
                </p>
                <p className="mt-0.5 font-body text-sm break-words text-ink">
                  {errorMessage(error)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                disabled={running}
                className="mt-0.5 shrink-0 rounded-lg border border-stamp-deep/30 bg-stamp px-3 py-1.5 font-code text-[11px] font-semibold uppercase tracking-[.1em] text-paper-card transition-colors hover:bg-stamp-deep disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp-deep"
              >
                Coba lagi
              </button>
            </div>
          )}

          <ChatComposer status={status} onSend={handleSend} onStop={stop} />

          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center font-code text-[10px] font-medium tracking-[.14em] uppercase text-stamp-deep/85">
            <CrossIcon className="size-3" aria-hidden />
            Keadaan darurat? Hubungi 119 atau datangi IGD terdekat
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Empty sheet ───────────────────────────────────────────────── */

function ThreadWelcome({ onStarter }: { onStarter: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <span className="pv-rise mb-4 inline-flex items-center gap-1.5 rounded-full border border-stamp/30 bg-stamp/[.05] px-2.5 py-1 font-code text-[10px] font-semibold uppercase tracking-[.18em] text-stamp-deep">
        Ruang Konsultasi
      </span>
      <h1 className="pv-rise pv-d1 max-w-lg font-display text-2xl font-extrabold tracking-tight text-balance text-ink sm:text-[2rem] sm:leading-[1.15]">
        Ada yang ingin ditanyakan{" "}
        <span className="underline decoration-stamp/60 decoration-dotted decoration-[3px] underline-offset-8">
          setelah berobat?
        </span>
      </h1>
      <p className="pv-rise pv-d2 mt-4 max-w-md font-body text-base italic leading-relaxed text-muted-foreground">
        Asisten ini sudah membaca catatan pemeriksaan Anda terakhir — tanyakan
        apa saja tentang obat, pola makan, atau jadwal kontrol.
      </p>

      <div className="pv-rise pv-d3 mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {STARTERS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onStarter(prompt)}
            className="rounded-xl border border-ink/20 bg-paper-card px-3.5 py-2.5 text-left text-[13px] leading-snug text-ink-soft shadow-[2px_3px_0_-1px_rgba(23,51,74,.06)] transition-all hover:-translate-y-px hover:border-ink/45 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────── */

/**
 * Follow-up prompts travel as `data-suggestion` parts on the final answer.
 * Absent parts simply yield an empty list — the chips never render.
 */
function extractSuggestions(message?: UIMessage): string[] {
  if (!message || message.role !== "assistant") return [];
  const out: string[] = [];
  for (const part of message.parts) {
    if (!part.type.startsWith("data-suggestion")) continue;
    const data = (part as { data: unknown }).data;
    if (typeof data === "string") {
      out.push(data);
    } else if (
      data &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).prompt === "string"
    ) {
      out.push((data as Record<string, unknown>).prompt as string);
    }
  }
  return out;
}

function errorMessage(error: Error): string {
  const raw = error.message?.trim();
  if (!raw) return "Periksa koneksi internet Anda, lalu coba lagi.";
  return raw.length > 220 ? `${raw.slice(0, 217)}…` : raw;
}
