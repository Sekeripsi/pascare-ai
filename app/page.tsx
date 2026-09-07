"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Check,
  Heart,
  LockKeyhole,
  MoveRight,
  Pill,
  Stethoscope,
} from "lucide-react";

// Deterministic bar widths for the decorative BPJS-style barcode
const BAR_WIDTHS = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 1, 2, 3];

const TRUST_TICKS = ["Kode hanya dari petugas", "Sesi aktif ±7 hari", "Riwayat percakapan terlindungi"];

export default function LandingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const goToChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = token.trim();
    if (!cleaned) return;
    router.push(`/chat/${encodeURIComponent(cleaned)}`);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-paper font-body text-ink selection:bg-stamp/20">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-ink/25 bg-paper-card shadow-[3px_4px_0_0_rgba(23,51,74,.08)] transition-transform group-hover:-translate-y-0.5">
              <Image src="/postvisit.svg" alt="Logo Pascare.ai" width={26} height={26} className="size-[26px]" unoptimized />
            </div>
            <div>
              <span className="block font-display text-base font-extrabold tracking-tight">
                Pascare<span className="text-stamp">.ai</span>
              </span>
              <span className="hidden font-code text-[9px] uppercase tracking-[.22em] text-ink-soft sm:block">
                Asisten Rawat Mandiri Pasien
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-5">
            <a
              href="#cara-kerja"
              className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:inline"
            >
              Cara Menggunakan
            </a>
            <a
              href="#bantuan"
              className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:inline"
            >
              Tanya Jawab
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/30 bg-paper-card px-3 py-1.5 text-xs font-semibold text-ink shadow-[2px_3px_0_0_rgba(23,51,74,.08)] transition-all hover:-translate-y-px hover:shadow-[3px_4px_0_0_rgba(23,51,74,.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp active:translate-y-0"
            >
              <LockKeyhole className="size-3.5" />
              <span>Portal Petugas</span>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative">
          {/* faint ledger rules, fading out from the top-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(to_bottom,rgba(23,51,74,.05)_0_1px,transparent_1px_32px)] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_72%)]"
          />

          <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-10 lg:px-8 lg:pt-20">
            <div>
              <p className="pv-rise pv-d1 mb-5 inline-flex items-center gap-2.5 font-code text-[11px] font-semibold uppercase tracking-[.22em] text-stamp">
                <span aria-hidden className="size-1.5 rounded-full bg-stamp" />
                Layanan pendampingan pasca kunjungan Puskesmas
              </p>

              <h1 className="pv-rise pv-d1 max-w-xl font-display text-[2.65rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4rem]">
                Pulang berobat, bukan pulang bingung.
              </h1>

              <p className="pv-rise pv-d2 mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                Obat, pola makan, jadwal kontrol, gejala lanjutan — tanyakan dengan bahasa
                sehari-hari, dijawab berdasarkan catatan pemeriksaan dari Puskesmas Anda.
              </p>

              <ul className="pv-rise pv-d2 mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {TRUST_TICKS.map((tick) => (
                  <li
                    key={tick}
                    className="inline-flex items-center gap-1.5 font-code text-[11px] uppercase tracking-[.14em] text-ink/70"
                  >
                    <Check className="size-3.5 text-sah" strokeWidth={3} />
                    {tick}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Signature: Kartu Konsultasi ── */}
            <div className="pv-rise pv-d2 relative mx-auto w-full max-w-md">
              <div className="relative rounded-xl border border-ink/25 bg-paper-card shadow-[10px_12px_0_-4px_rgba(23,51,74,.09)] transition-shadow duration-300 hover:shadow-[14px_16px_0_-4px_rgba(23,51,74,.13)]">
                {/* perforated take-a-ticket edge */}
                <div
                  aria-hidden
                  className="absolute inset-y-3 left-[9px] w-[13px] [background-image:radial-gradient(circle_at_50%_50%,var(--color-paper)_3.4px,transparent_3.9px)] [background-size:100%_17px]"
                />
                <div aria-hidden className="absolute inset-y-0 left-[27px] border-l border-dashed border-ink/30" />

                {/* SAH stamp */}
                <div
                  aria-hidden
                  className="pv-stamp pointer-events-none absolute -top-6 right-5 z-10 flex size-[78px] flex-col items-center justify-center rounded-full border-2 border-stamp/80 text-stamp mix-blend-multiply"
                >
                  <div className="absolute inset-[5px] rounded-full border border-stamp/60" />
                  <Check className="size-3.5" strokeWidth={3} />
                  <span className="font-display text-sm font-extrabold leading-none tracking-[.18em]">SAH</span>
                  <span className="mt-1 font-code text-[6px] font-semibold tracking-[.24em]">PASCARE.AI</span>
                </div>

                <div className="py-7 pl-12 pr-6 sm:p-8 sm:pl-14">
                  <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 font-code text-[10px] font-semibold uppercase tracking-[.2em] text-ink/55">
                    <span>Kartu Konsultasi</span>
                    <span>Pasca Kunjungan</span>
                  </div>

                  <form onSubmit={goToChat}>
                    <label htmlFor="token" className="block font-display text-base font-bold">
                      Kode Konsultasi
                    </label>
                    <p className="mb-4 mt-1 text-sm text-ink-soft">
                      Tulis persis seperti pada kartu yang diberikan petugas.
                    </p>

                    <input
                      id="token"
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder="PV-0000-0000"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="h-12 w-full border-b-2 border-dotted border-ink/40 bg-transparent text-center font-code text-lg font-semibold uppercase tracking-[.22em] text-ink caret-stamp outline-none transition-colors placeholder:text-ink/25 focus:border-solid focus:border-stamp"
                    />

                    <button
                      type="submit"
                      className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-ink bg-ink font-display text-sm font-bold tracking-wide text-paper shadow-[4px_5px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px hover:shadow-[6px_7px_0_0_rgba(23,51,74,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp active:translate-y-0 active:shadow-[2px_3px_0_0_rgba(23,51,74,.25)]"
                    >
                      Mulai Konsultasi
                      <MoveRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>

                  <p className="mt-4 text-sm italic leading-relaxed text-ink-soft">
                    Akses hanya melalui kode pribadi dari kunjungan Anda.
                  </p>

                  <div className="mt-6 border-t border-dashed border-ink/20 pt-4">
                    <div aria-hidden className="flex h-6 items-end gap-[3px] opacity-75">
                      {BAR_WIDTHS.map((width, index) => (
                        <span key={index} className="h-full bg-ink/80" style={{ width: `${width}px` }} />
                      ))}
                    </div>
                    <p className="mt-2 font-code text-[9px] uppercase tracking-[.2em] text-ink/45">
                      Pascare.ai · Dokumen pendamping pemulihan di rumah
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Yang sering ditanyakan ─────────────────────────────── */}
        <section className="border-t border-ink/10 bg-paper/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 font-code text-[11px] font-semibold uppercase tracking-[.22em] text-stamp">
                Catatan Pemulihan
              </p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Yang sering ditanyakan pasien
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Fokus pada pemulihan yang aman di rumah — bukan sekadar chatbot umum.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Pill,
                  title: "Aturan minum obat",
                  body: "Dosis, jam minum, jeda antarobat, dan cara menyimpan obat dengan aman.",
                },
                {
                  icon: Stethoscope,
                  title: "Pantangan dan aktivitas",
                  body: "Panduan makanan dan aktivitas yang sesuai dengan kondisi pemulihan Anda.",
                },
                {
                  icon: Calendar,
                  title: "Jadwal kontrol ulang",
                  body: "Kapan harus kembali ke Puskesmas, dan gejala mana yang butuh perhatian cepat.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="relative rounded-lg border border-ink/15 bg-paper-card p-6 shadow-[5px_6px_0_-3px_rgba(23,51,74,.06)] transition-all hover:-translate-y-1 hover:shadow-[7px_9px_0_-3px_rgba(23,51,74,.1)]"
                >
                  <div aria-hidden className="absolute inset-x-6 top-0 h-[3px] bg-ink/60" />
                  <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-ink/20 bg-paper text-ink">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Alur konsultasi ────────────────────────────────────── */}
        <section id="cara-kerja" className="border-t border-ink/10 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 font-code text-[11px] font-semibold uppercase tracking-[.22em] text-stamp">
                Alur Konsultasi
              </p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Tiga langkah dari loket ke ruang chat
              </h2>
            </div>

            <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              {/* dashed route connector */}
              <div
                aria-hidden
                className="absolute left-[15%] right-[15%] top-5 hidden border-t-2 border-dashed border-ink/25 md:block"
              />
              {[
                {
                  step: "1",
                  title: "Selesai pemeriksaan",
                  body: "Petugas memberi kode konsultasi resmi setelah kunjungan tercatat.",
                },
                {
                  step: "2",
                  title: "Masukkan kode",
                  body: "Tulis kode pada kartu di atas, lalu masuk ke ruang chat pribadi Anda.",
                },
                {
                  step: "3",
                  title: "Tanya kapan saja",
                  body: "Gunakan bahasa sehari-hari untuk bertanya soal obat, kontrol, atau gejala.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="relative flex flex-col items-center gap-3 text-center">
                  <div className="relative z-10 mb-5 flex size-10 items-center justify-center rounded-full border-2 border-ink bg-paper font-display text-sm font-extrabold">
                    {step}
                  </div>
                  <h3 className="font-display text-base font-bold text-center">{title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft text-center">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Catatan darurat ────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="rounded-xl border-2 border-stamp/70 bg-paper-card p-5 shadow-[6px_8px_0_-3px_rgba(188,63,34,.1)] sm:p-6">
            <div className="rounded-lg border border-dashed border-stamp/45 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stamp/10 text-stamp">
                <AlertTriangle className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-extrabold text-[#8a2a12]">
                  Keadaan darurat? Jangan tunggu jawaban chat.
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#8a2a12]/90">
                  Bila muncul sesak napas berat, nyeri dada hebat, pingsan, kejang, atau perdarahan —
                  segera hubungi ambulans atau datangi IGD terdekat.
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="font-code text-[10px] font-semibold uppercase tracking-[.2em] text-stamp/80">
                  Hubungi cepat
                </p>
                <p className="whitespace-nowrap font-display text-2xl font-extrabold text-stamp">
                  119 · IGD
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tanya jawab ────────────────────────────────────────── */}
        <section id="bantuan" className="border-t border-ink/10 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="mb-3 font-code text-[11px] font-semibold uppercase tracking-[.22em] text-stamp">
                Pertanyaan Umum
              </p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Sebelum mengetik kode
              </h2>
            </div>

            <div className="divide-y divide-ink/10 border-y border-ink/15">
              {[
                {
                  q: "Apakah asisten ini menggantikan peran dokter saya?",
                  a: "Tidak. Asisten ini mendampingi Anda untuk memahami kembali penjelasan, resep obat, dan anjuran yang telah diberikan oleh dokter Puskesmas. Jika keluhan berlanjut, Anda tetap disarankan untuk periksa kembali.",
                },
                {
                  q: "Bagaimana jika saya tidak memiliki kode akses?",
                  a: "Kode akses diberikan otomatis setelah kunjungan Anda di Puskesmas selesai dicatat. Silakan hubungi petugas loket atau nomor informasi Puskesmas jika Anda belum menerima pesan tautan konsultasi.",
                },
                {
                  q: "Berapa lama masa aktif konsultasi saya?",
                  a: "Masa aktif sesi konsultasi biasanya berlaku selama 7 hari sejak tanggal kunjungan Anda, sesuai durasi rata-rata konsumsi obat dan masa pemulihan.",
                },
                {
                  q: "Apakah data riwayat kesehatan saya aman?",
                  a: "Ya, data Anda dilindungi dengan enkripsi standar kesehatan dan hanya dapat diakses melalui kode pribadi yang sah milik Anda.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="grid gap-2 py-6 sm:grid-cols-[240px_1fr] sm:gap-10">
                  <h3 className="font-display text-[15px] font-bold leading-snug">{q}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer, ala kop surat ─────────────────────────────────── */}
      <footer className="mt-4">
        <div aria-hidden className="border-t-[3px] border-ink/70" />
        <div className="border-t border-ink/15 bg-paper/60 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <Heart className="size-4 fill-stamp/15 text-stamp" />
              <div>
                <span className="block font-display text-sm font-extrabold tracking-tight">
                  Pascare<span className="text-stamp">.ai</span>
                </span>
                <span className="block font-code text-[9px] uppercase tracking-[.2em] text-ink-soft">
                  Layanan Pendampingan Pasien Pasca Kunjungan
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-code text-[11px] font-semibold uppercase tracking-[.16em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
            >
              <LockKeyhole className="size-3.5" />
              <span>Login Petugas Medis</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
