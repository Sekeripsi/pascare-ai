"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";

// Shared ledger styling — same voice as the dashboard Auth Gate
const inputCls =
  "w-full rounded-lg border border-ink/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelCls = "mb-1 block font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/60";

// Demo account seeded on the SIMPUS backend (see simpus-backend/docs/api-endpoints.md)
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123456";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect") || "/dashboard";
  // Only honor same-origin relative paths. Backslashes and whitespace are rejected
  // explicitly: the WHATWG URL parser treats "/\evil.com" as protocol-relative and
  // strips tabs/newlines, so both slip past a plain "//" check into off-site redirects.
  const redirectUrl =
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//") &&
    !/[\\\s]/.test(requestedRedirect)
      ? requestedRedirect
      : "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Silakan masukkan username dan password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Hands the credentials to NextAuth, which exchanges them with the SIMPUS
      // backend server-side and sets an HttpOnly session cookie. No raw token
      // ever reaches the browser.
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("Username atau password salah.");
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("Gagal menghubungi server otentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    setErrorMessage(null);
  };

  return (
    <div className="pv-rise pv-d1 w-full max-w-md rounded-xl border border-ink/25 bg-paper-card p-6 shadow-[10px_12px_0_-4px_rgba(23,51,74,.09)] sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg border border-ink/25 bg-paper text-ink">
          <Lock className="size-5" />
        </div>
        <p className="mb-1.5 font-code text-[10px] font-semibold uppercase tracking-[.22em] text-stamp">
          Portal Petugas
        </p>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Masuk Buku Registrasi
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Gunakan akun yang terdaftar pada database SIMPUS untuk mengelola token konsultasi.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-stamp/35 bg-stamp/[.06] px-3.5 py-3 text-sm text-stamp-deep animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="size-4 shrink-0 text-stamp" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-username" className={labelCls}>
            Username
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
            <input
              id="login-username"
              type="text"
              required
              autoFocus
              autoComplete="username"
              placeholder="cth: admin"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className={labelCls}>
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Password akun"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputCls} pl-9 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink/45 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-ink bg-ink font-display text-sm font-bold tracking-wide text-paper shadow-[4px_5px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px hover:shadow-[6px_7px_0_0_rgba(23,51,74,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp active:translate-y-0 active:shadow-[2px_3px_0_0_rgba(23,51,74,.25)] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            <span>Masuk ke Dashboard</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginShell() {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-clip bg-paper font-body text-ink selection:bg-stamp/20">
      {/* faint ledger rules, fading out from the top-right — same motif as the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(to_bottom,rgba(23,51,74,.05)_0_1px,transparent_1px_32px)] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_72%)]"
      />

      <header className="relative sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-ink/25 bg-paper-card shadow-[3px_4px_0_0_rgba(23,51,74,.08)] transition-transform group-hover:-translate-y-0.5">
              <Image src="/postvisit.svg" alt="Logo Pascare.ai" width={22} height={22} className="size-[22px]" unoptimized />
            </div>
            <div>
              <span className="block font-display text-base font-extrabold tracking-tight">
                Pascare<span className="text-stamp">.ai</span>
              </span>
              <span className="block font-code text-[9px] uppercase tracking-[.22em] text-ink-soft">
                Portal Petugas
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="font-code text-xs uppercase tracking-[.18em] text-ink-soft">Memuat…</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <footer className="relative border-t border-ink/15 bg-paper/60 py-4 text-center">
        <p className="font-code text-[10px] uppercase tracking-[.18em] text-ink-soft">
          Pascare.ai • Sistem Asisten Pasca Kunjungan • Otentikasi Terintegrasi Database SIMPUS
        </p>
      </footer>
    </div>
  );
}
