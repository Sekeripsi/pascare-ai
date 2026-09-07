"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";

/** Slim kop-surat header: brand on the left, session-verified chip on the right. */
export const ChatHeader = ({ token }: { token?: string }) => {
  return (
    <header className="shrink-0 bg-paper-card">
      <div className="mx-auto flex h-14 w-full max-w-[52rem] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-ink/25 bg-paper shadow-[2px_3px_0_0_rgba(23,51,74,.08)] transition-transform group-hover:-translate-y-px">
            <Image src="/postvisit.svg" alt="Logo Pascare.ai" width={20} height={20} className="size-5" unoptimized />
          </div>
          <span className="font-display text-sm font-extrabold tracking-tight text-ink">
            Pascare<span className="text-stamp">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {token && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sah/35 bg-sah/[.07] px-2 py-0.5 font-code text-[9px] font-semibold uppercase tracking-[.1em] text-sah sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[.12em]">
              <CheckIcon className="size-2.5 sm:size-3" strokeWidth={3} />
              <span className="hidden min-[360px]:inline">Sesi </span>Sah · ••••{token.slice(-4)}
            </span>
          )}
          <Link
            href="/"
            aria-label="Kembali ke beranda"
            title="Kembali ke beranda"
            className="inline-flex size-8 items-center justify-center rounded-md border border-ink/20 bg-paper text-ink-soft transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
        </div>
      </div>

      {/* Tear line: the kartu konsultasi, detached onto the consultation desk */}
      <div
        aria-hidden
        className="h-3 w-full bg-paper-card [background-image:radial-gradient(circle_at_50%_50%,#ebe6d8_3.2px,transparent_3.7px)] [background-size:100%_12px]"
      />
    </header>
  );
};
