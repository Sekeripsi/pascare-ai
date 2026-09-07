"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Heart,
  Key,
  Layers,
  LogOut,
  MessageSquare,
  Pill,
  Plus,
  Power,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";

// Types
interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "DOCTOR" | "STAFF";
}

interface Patient {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: string;
  noTlp?: string | null;
  alamatTinggal?: string | null;
  tanggalLahir?: string | null;
  umur?: number | null;
  golDarah?: string | null;
}

interface Pendaftaran {
  id: string;
  tglKunjungan: string;
  noAntrian: string;
  poliklinik: string;
  unitLayanan?: string;
  pembayaran?: string;
  catatan?: string | null;
}

interface Diagnosis {
  id: string;
  diagnosis?: string | null;
  kodeIcd?: string | null;
}

interface Anamnesis {
  id: string;
  keluhan?: string | null;
}

interface Pemeriksaan {
  id: string;
  keadaan?: string | null;
  kesadaran?: string | null;
  sistol?: number | null;
  diastol?: number | null;
  suhu?: number | null;
  nadi?: number | null;
  respirasi?: number | null;
}

interface PengobatanItem {
  namaObat?: string;
  nama?: string;
  dosis?: string;
  jumlah?: string;
  aturanPakai?: string;
  caraPakai?: string;
  keterangan?: string;
}

interface Pengobatan {
  id: string;
  pengobatan?: PengobatanItem[];
}

interface PulangRujuk {
  id: string;
  tglPulang?: string | null;
  statusPulang?: string | null;
  kie?: string | null;
  plan?: string | null;
  rencKunjBerikutnya?: string | null;
}

interface RekamMedis {
  id: string;
  pasienId: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  pasien: Patient;
  pendaftaran?: Pendaftaran | null;
  kajianAwal?: unknown;
  anamnesis?: Anamnesis | null;
  pemeriksaan?: Pemeriksaan | null;
  diagnosis?: Diagnosis | null;
  tindakan?: unknown;
  pengobatan?: Pengobatan | null;
  pulangRujuk?: PulangRujuk | null;
  asuhan?: unknown;
  lab?: unknown;
}

interface PostVisitToken {
  id: string;
  rekamMedisId: string;
  token: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rekamMedis: RekamMedis;
}

interface AvailableRecord {
  id: string;
  createdAt: string;
  status: string;
  pasien: Patient;
  pendaftaran?: Pendaftaran | null;
  diagnosis?: Diagnosis | null;
  anamnesis?: Anamnesis | null;
  postVisit?: { id: string; token: string; expiresAt: string; isActive: boolean } | null;
}

// Preset definitions for fast developer testing
const DEV_PRESETS = [
  {
    id: "hipertensi",
    title: "Hipertensi Primer (Kardiologi/Umum)",
    icon: "🫀",
    patientName: "Budi Santoso",
    nik: "3171021508850001",
    gender: "L",
    poliklinik: "UMUM",
    keluhan: "Tengkuk terasa kaku, sering pusing berputar sejak 3 hari yang lalu, riwayat darah tinggi tidak teratur minum obat.",
    diagnosis: "Hipertensi Esensial (Primer)",
    kodeIcd: "I10",
    sistol: 155,
    diastol: 95,
    suhu: 36.7,
    nadi: 86,
    respirasi: 18,
    pengobatan: [
      { namaObat: "Amlodipine 10mg", dosis: "1x1 tablet", jumlah: "30 tablet", aturanPakai: "Malam hari sebelum tidur" },
      { namaObat: "Captopril 25mg", dosis: "2x1 tablet (bila perlu)", jumlah: "10 tablet", aturanPakai: "Saat tensi tinggi > 160" },
      { namaObat: "Vitamin B Kompleks", dosis: "1x1 tablet", jumlah: "15 tablet", aturanPakai: "Pagi sesudah makan" },
    ],
    kie: "Kurangi konsumsi garam maksimal 1 sdt/hari, batasi gorengan/lemak, olahraga ringan 30 menit jalan kaki, dan ukur tensi rutin mingguan.",
    plan: "Kontrol ulang 2 minggu lagi di Poli Rawat Jalan untuk evaluasi efektivitas terapi tensi.",
  },
  {
    id: "diabetes",
    title: "Diabetes Melitus Tipe 2 (Poli Lansia)",
    icon: "🩸",
    patientName: "Hj. Aminah Suryani",
    nik: "3201145806650003",
    gender: "P",
    poliklinik: "LANSIA",
    keluhan: "Cepat lelah, sering buang air kecil di malam hari, sering merasa haus dan lapar meski sudah makan.",
    diagnosis: "Non-insulin-dependent diabetes mellitus without complications",
    kodeIcd: "E11.9",
    sistol: 130,
    diastol: 80,
    suhu: 36.5,
    nadi: 78,
    respirasi: 18,
    pengobatan: [
      { namaObat: "Metformin HCl 500mg", dosis: "2x1 tablet", jumlah: "60 tablet", aturanPakai: "Bersama/sesudah makan" },
      { namaObat: "Glimepiride 2mg", dosis: "1x1 tablet", jumlah: "30 tablet", aturanPakai: "Pagi 15 menit sebelum makan" },
    ],
    kie: "Atur pola makan dengan konsep 3J (Jadwal, Jumlah, Jenis makanan), hindari minuman manis berpemanis buatan, gunakan alas kaki tertutup untuk mencegah luka diabetes.",
    plan: "Cek Gula Darah Puasa dan HbA1c 1 bulan berikutnya. Segera ke UGD jika lemas gemetar (hipoglikemia).",
  },
  {
    id: "ispa",
    title: "ISPA / Batuk & Radang Tenggorokan",
    icon: "🫁",
    patientName: "Rian Pratama",
    nik: "3302052003980004",
    gender: "L",
    poliklinik: "UMUM",
    keluhan: "Demam naik turun sejak 2 hari, tenggorokan nyeri menelan, batuk berdahak kekuningan, hidung tersumbat.",
    diagnosis: "Infeksi Saluran Pernapasan Akut (ISPA)",
    kodeIcd: "J06.9",
    sistol: 115,
    diastol: 75,
    suhu: 38.2,
    nadi: 92,
    respirasi: 22,
    pengobatan: [
      { namaObat: "Paracetamol 500mg", dosis: "3x1 tablet", jumlah: "10 tablet", aturanPakai: "Bila demam / nyeri" },
      { namaObat: "Amoxicillin 500mg", dosis: "3x1 tablet", jumlah: "15 tablet", aturanPakai: "Wajib dihabiskan tiap 8 jam" },
      { namaObat: "Ambroxol 30mg", dosis: "3x1 tablet", jumlah: "10 tablet", aturanPakai: "Sesudah makan untuk mengencerkan dahak" },
      { namaObat: "Vitamin C 500mg", dosis: "1x1 tablet", jumlah: "10 tablet", aturanPakai: "Pagi hari" },
    ],
    kie: "Istirahat total, minum air putih hangat minimal 2.5 liter per hari, gunakan masker agar tidak menularkan ke keluarga, hindari es dan gorengan.",
    plan: "Jika demam menetap lebih dari 3 hari meski minum antibiotik, segera periksa darah ulang.",
  },
  {
    id: "gerd",
    title: "Dispepsia / GERD Akut",
    icon: "🩺",
    patientName: "Dewi Lestari",
    nik: "3578016409940002",
    gender: "P",
    poliklinik: "UMUM",
    keluhan: "Nyeri ulu hati seperti terbakar (heartburn), perut kembung begah, mual setelah makan, mulut terasa asam.",
    diagnosis: "Gastro-esophageal reflux disease without esophagitis",
    kodeIcd: "K21.9",
    sistol: 110,
    diastol: 70,
    suhu: 36.6,
    nadi: 80,
    respirasi: 16,
    pengobatan: [
      { namaObat: "Omeprazole 20mg", dosis: "2x1 kapsul", jumlah: "14 kapsul", aturanPakai: "30 menit sebelum makan pagi & malam" },
      { namaObat: "Antasida Doen Tablet", dosis: "3x1 tablet kunyah", jumlah: "15 tablet", aturanPakai: "1 jam sebelum makan atau saat nyeri ulu hati" },
      { namaObat: "Domperidone 10mg", dosis: "3x1 tablet", jumlah: "10 tablet", aturanPakai: "Bila mual, 15 menit sebelum makan" },
    ],
    kie: "Makan dalam porsi kecil tetapi sering (small frequent meals), jangan langsung berbaring dalam waktu 2 jam setelah makan, hindari kopi, cokelat, makanan pedas dan asam.",
    plan: "Evaluasi klinis setelah 7 hari pengobatan.",
  },
  {
    id: "pulpitis",
    title: "Pulpitis Akut (Poli Gigi)",
    icon: "🦷",
    patientName: "Agus Salim",
    nik: "3404081207880005",
    gender: "L",
    poliklinik: "GIGI",
    keluhan: "Gigi geraham kanan bawah berlubang terasa ngilu berdenyut hebat menjalar ke telinga, susah tidur.",
    diagnosis: "Pulpitis irreversibel akut",
    kodeIcd: "K04.0",
    sistol: 125,
    diastol: 85,
    suhu: 37.1,
    nadi: 84,
    respirasi: 18,
    pengobatan: [
      { namaObat: "Asam Mefenamat 500mg", dosis: "3x1 kaplet", jumlah: "10 kaplet", aturanPakai: "Sesudah makan bila nyeri berdenyut" },
      { namaObat: "Amoxicillin 500mg", dosis: "3x1 tablet", jumlah: "15 tablet", aturanPakai: "Habiskan tiap 8 jam" },
    ],
    kie: "Jaga kebersihan gigi dengan sikat gigi 2x sehari, gunakan air garam hangat untuk kumur, hindari makanan terlalu dingin atau terlalu manis.",
    plan: "Jadwalkan perawatan saluran akar (PSA) / penambalan gigi permanen setelah peradangan akut mereda dalam 3-5 hari.",
  },
];

// Shared form styling — ledger inputs & labels
const inputCls =
  "w-full rounded-lg border border-ink/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelCls = "mb-1 block font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/60";
const iconBtnCls =
  "inline-flex size-8 items-center justify-center rounded-md border border-ink/20 bg-paper text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// Utility function to mask NIK for privacy
const maskNIK = (nik: string | undefined | null): string => {
  if (!nik) return "-";
  if (nik.length < 10) return nik; // If NIK is too short, return as is
  return `${nik.substring(0, 6)}*****${nik.substring(nik.length - 4)}`;
};

interface DashboardClientProps {
  user: AuthUser;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  // Authentication State — profile arrives via props from the server wrapper,
  // which resolves it through auth(); no client-side fetching or caching.
  const currentUser = user;

  // Dashboard Data State
  const [tokens, setTokens] = useState<PostVisitToken[]>([]);
  const [availableRecords, setAvailableRecords] = useState<AvailableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "INACTIVE">("ALL");
  const [clinicFilter, setClinicFilter] = useState<string>("ALL");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Modals state
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "custom" | "records">("presets");
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<PostVisitToken | null>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  // Custom Token Form State
  const [customForm, setCustomForm] = useState({
    patientName: "",
    nik: "",
    noTlp: "",
    gender: "L",
    poliklinik: "UMUM",
    keluhan: "",
    diagnosis: "",
    kodeIcd: "",
    sistol: "120",
    diastol: "80",
    suhu: "36.8",
    nadi: "80",
    respirasi: "20",
    obatList: [{ namaObat: "Paracetamol 500mg", dosis: "3x1 tablet", aturanPakai: "Bila demam", jumlah: "10 tablet" }],
    kie: "",
    plan: "",
    expiresInDays: 7,
    isExpired: false,
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>("hipertensi");
  const [presetExpiryOption, setPresetExpiryOption] = useState<number>(7);
  const [presetIsExpired, setPresetIsExpired] = useState<boolean>(false);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Logout handler — clears the NextAuth session cookie server-side, then redirects.
  const handleLogout = async () => {
    await signOut({ redirectTo: "/login" });
  };

  const fetchTokens = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/tokens", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTokens(json.data);
      } else {
        showToast(json.error || "Gagal memuat daftar token", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saat menghubungi server", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchAvailableRecords = async () => {
    try {
      const res = await fetch("/api/tokens/available-records", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAvailableRecords(json.data);
      }
    } catch (err) {
      console.error("Error loading records:", err);
    }
  };

  useEffect(() => {
    // Access is enforced by the server wrapper before this renders;
    // the profile arrives via props, so bootstrapping only loads data.
    fetchTokens(false);
    fetchAvailableRecords();
    // Run once on mount only — handlers above are stable closures over setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Copy helper
  const handleCopy = (text: string, type: "token" | "link", tokenId: string) => {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(tokenId);
      showToast("Token berhasil disalin ke clipboard!");
      setTimeout(() => setCopiedToken(null), 2000);
    } else {
      setCopiedLink(tokenId);
      showToast("Link Chat Pasien berhasil disalin ke clipboard!");
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (item: PostVisitToken) => {
    try {
      const res = await fetch(`/api/tokens/${item.id}`, { method: "PATCH" });
      const json = await res.json();
      if (json.success) {
        setTokens((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isActive: !t.isActive } : t))
        );
        showToast(`Token pasien ${item.rekamMedis?.pasien?.nama || ""} ${!item.isActive ? "diaktifkan" : "dinonaktifkan"}`);
      } else {
        showToast(json.error || "Gagal mengubah status token", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal memperbarui status", "error");
    }
  };

  // Delete token
  const handleDeleteToken = async (id: string, name: string) => {
    if (!window.confirm(`Hapus token chat untuk ${name}? Pasien tidak akan dapat mengakses riwayat chat ini.`)) return;
    try {
      const res = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
        showToast("Token berhasil dihapus");
      } else {
        showToast(json.error || "Gagal menghapus token", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus", "error");
    }
  };

  // Generate from Preset
  const handleGeneratePreset = async (presetId: string, openChat = false) => {
    const preset = DEV_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setIsCreatingToken(true);
    try {
      const payload = {
        action: "create-test",
        patientName: preset.patientName,
        nik: preset.nik + Math.floor(Math.random() * 100).toString().padStart(2, "0"),
        jenisKelamin: preset.gender,
        poliklinik: preset.poliklinik,
        keluhan: preset.keluhan,
        diagnosis: preset.diagnosis,
        kodeIcd: preset.kodeIcd,
        sistol: preset.sistol,
        diastol: preset.diastol,
        suhu: preset.suhu,
        nadi: preset.nadi,
        respirasi: preset.respirasi,
        pengobatan: preset.pengobatan,
        kie: preset.kie,
        plan: preset.plan,
        expiresInDays: presetExpiryOption,
        isExpired: presetIsExpired,
      };

      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        showToast(`Token uji coba "${preset.title}" berhasil dibuat!`, "success");
        setIsDevModalOpen(false);
        fetchTokens(false);
        fetchAvailableRecords();

        if (openChat && json.data.token) {
          window.open(`/chat/${json.data.token}`, "_blank");
        }
      } else {
        showToast(json.error || "Gagal membuat token preset", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan saat generate", "error");
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Generate from Custom Form
  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.patientName.trim()) {
      showToast("Nama pasien wajib diisi", "error");
      return;
    }

    setIsCreatingToken(true);
    try {
      const payload = {
        action: "create-test",
        patientName: customForm.patientName,
        nik: customForm.nik,
        noTlp: customForm.noTlp,
        jenisKelamin: customForm.gender,
        poliklinik: customForm.poliklinik,
        keluhan: customForm.keluhan,
        diagnosis: customForm.diagnosis || "Diagnosis Klinis Umum",
        kodeIcd: customForm.kodeIcd || "Z00.0",
        sistol: Number(customForm.sistol) || 120,
        diastol: Number(customForm.diastol) || 80,
        suhu: Number(customForm.suhu) || 36.8,
        nadi: Number(customForm.nadi) || 80,
        respirasi: Number(customForm.respirasi) || 20,
        pengobatan: customForm.obatList.filter((o) => o.namaObat.trim() !== ""),
        kie: customForm.kie,
        plan: customForm.plan,
        expiresInDays: customForm.expiresInDays,
        isExpired: customForm.isExpired,
      };

      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        showToast(`Token untuk "${customForm.patientName}" berhasil dibuat!`);
        setIsDevModalOpen(false);
        fetchTokens(false);
        fetchAvailableRecords();
      } else {
        showToast(json.error || "Gagal membuat token kustom", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Generate for existing RekamMedis
  const handleGenerateForExistingRecord = async (rekamMedisId: string, days = 7) => {
    setIsCreatingToken(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          rekamMedisId,
          expiresInDays: days,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Token post-visit berhasil digenerate untuk rekam medis ini!");
        setIsDevModalOpen(false);
        fetchTokens(false);
        fetchAvailableRecords();
      } else {
        showToast(json.error || "Gagal men-generate token", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saat generate token", "error");
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = tokens.length;
    const now = new Date();
    const active = tokens.filter((t) => t.isActive && new Date(t.expiresAt) > now).length;
    const expired = tokens.filter((t) => new Date(t.expiresAt) <= now).length;
    const inactive = tokens.filter((t) => !t.isActive).length;

    // Unique patients
    const patientSet = new Set<string>();
    tokens.forEach((t) => {
      if (t.rekamMedis?.pasien?.id) patientSet.add(t.rekamMedis.pasien.id);
    });

    return { total, active, expired, inactive, uniquePatients: patientSet.size };
  }, [tokens]);

  // Filtered Tokens
  const filteredTokens = useMemo(() => {
    const now = new Date();
    return tokens.filter((t) => {
      const isExpired = new Date(t.expiresAt) <= now;
      const isActive = t.isActive && !isExpired;

      // Status filter
      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter === "EXPIRED" && !isExpired) return false;
      if (statusFilter === "INACTIVE" && t.isActive) return false;

      // Clinic filter
      if (clinicFilter !== "ALL" && t.rekamMedis?.pendaftaran?.poliklinik !== clinicFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const pName = t.rekamMedis?.pasien?.nama?.toLowerCase() || "";
        const pNik = t.rekamMedis?.pasien?.nik?.toLowerCase() || "";
        const pPhone = t.rekamMedis?.pasien?.noTlp?.toLowerCase() || "";
        const diag = t.rekamMedis?.diagnosis?.diagnosis?.toLowerCase() || "";
        const icd = t.rekamMedis?.diagnosis?.kodeIcd?.toLowerCase() || "";
        const tokenStr = t.token.toLowerCase();

        return (
          pName.includes(query) ||
          pNik.includes(query) ||
          pPhone.includes(query) ||
          diag.includes(query) ||
          icd.includes(query) ||
          tokenStr.includes(query)
        );
      }

      return true;
    });
  }, [tokens, statusFilter, clinicFilter, searchQuery]);

  // Format Helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Ledger status logic: fresh ink = aktif, red ink = expiring/dead, faded = off
  const getExpiryLabel = (expiresAtStr: string, isActive: boolean) => {
    if (!isActive) {
      return { label: "Dinonaktifkan", color: "border-ink/25 bg-ink/[.04] text-ink/55", dot: "bg-ink/40" };
    }
    const now = new Date();
    const expiry = new Date(expiresAtStr);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { label: "Kadaluarsa", color: "border-stamp/35 bg-stamp/[.07] text-stamp-deep", dot: "bg-stamp/70" };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return { label: `Aktif (${diffDays} hari lagi)`, color: "border-sah/40 bg-sah/[.08] text-sah", dot: "bg-sah animate-pulse" };
    }
    if (diffHours > 0) {
      return { label: `Aktif (${diffHours} jam lagi)`, color: "border-stamp/35 bg-stamp/[.07] text-stamp-deep", dot: "bg-stamp animate-pulse" };
    }
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return {
      label: `Aktif (${diffMins} mnt lagi)`,
      color: "border-stamp/35 bg-stamp/[.07] text-stamp-deep",
      dot: "bg-stamp animate-pulse",
    };
  };

  // Main Authenticated Dashboard
  return (
    <div className="min-h-screen bg-paper pb-16 font-body text-ink selection:bg-stamp/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-ink/20 bg-paper-card px-4 py-3 shadow-[6px_7px_0_-3px_rgba(23,51,74,.14)] animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-sah" />}
          {toastMessage.type === "error" && <AlertCircle className="size-5 shrink-0 text-stamp" />}
          {toastMessage.type === "info" && <Sparkles className="size-5 shrink-0 text-ink-soft" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 p-0.5 text-ink/45 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-ink/15 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-ink/25 bg-paper-card shadow-[3px_4px_0_0_rgba(23,51,74,.08)]">
              <Image src="/postvisit.svg" alt="Logo Pascare.ai" width={26} height={26} className="size-[26px]" unoptimized />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base font-extrabold tracking-tight">
                  Dashboard <span className="text-stamp">Pascare.ai</span>
                </h1>
                <span className="rounded border border-ink/25 bg-paper px-1.5 py-0.5 font-code text-[9px] font-semibold uppercase tracking-[.16em] text-ink-soft">
                  Dev & Petugas
                </span>
              </div>
              <p className="font-code text-[9px] uppercase tracking-[.2em] text-ink/50">
                Buku Registrasi Digital · Manajemen Token
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authenticated User Pill */}
            <div className="hidden items-center gap-2.5 rounded-lg border border-ink/20 bg-paper-card px-3 py-1.5 md:flex">
              <div className="flex size-7 items-center justify-center rounded-full border border-ink/25 bg-paper font-display text-xs font-extrabold text-ink">
                {currentUser?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <span className="block text-xs font-semibold leading-tight">{currentUser?.name || "Petugas"}</span>
                <span className="block font-code text-[10px] text-ink/50">@{currentUser?.username || "-"}</span>
              </div>
              <span className="rounded border border-sah/40 bg-sah/[.08] px-1.5 py-0.5 font-code text-[9px] font-semibold text-sah">
                {currentUser?.role || "-"}
              </span>
            </div>

            <button
              onClick={() => fetchTokens(false)}
              disabled={isRefreshing}
              title="Refresh daftar token"
              className={`${iconBtnCls} h-8 gap-1.5 px-2.5 disabled:opacity-50`}
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => {
                setIsDevModalOpen(true);
                fetchAvailableRecords();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-ink bg-ink px-3.5 py-2 font-display text-xs font-bold tracking-wide text-paper shadow-[3px_4px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px hover:shadow-[5px_6px_0_0_rgba(23,51,74,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(23,51,74,.25)]"
            >
              <Plus className="size-3.5" />
              <span>Tambah / Test Token</span>
            </button>

            <button
              onClick={handleLogout}
              title="Keluar dari dashboard"
              className={`${iconBtnCls} hover:border-stamp/40 hover:bg-stamp/[.05] hover:text-stamp`}
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Banner — kepala buku registrasi */}
        <section className="relative mb-8 overflow-hidden rounded-xl border border-ink/25 bg-paper-card shadow-[8px_10px_0_-4px_rgba(23,51,74,.08)]">
          <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-ink/70" />

          <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/25 bg-paper px-2.5 py-1 font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink-soft">
                <ShieldCheck className="size-3.5 text-sah" />
                <span>Terotentikasi — {currentUser?.name || "Petugas"} ({currentUser?.role || "-"})</span>
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Kelola Token Konsultasi Pasien
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Token Pascare membuka ruang chat AI yang memahami konteks rekam medis pasien — diagnosis,
                resep obat, tanda vital, dan anjuran dokter. Gunakan fitur developer di bawah untuk menguji
                skenario penyakit secara instan.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 md:self-center">
              <button
                onClick={() => {
                  setSelectedPresetId("hipertensi");
                  setIsDevModalOpen(true);
                  setActiveTab("presets");
                }}
                className="rounded-lg border border-ink/20 bg-paper px-3.5 py-2 text-xs font-medium text-ink shadow-[2px_3px_0_0_rgba(23,51,74,.06)] transition-all hover:-translate-y-px hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                🫀 Test Hipertensi
              </button>
              <button
                onClick={() => {
                  setSelectedPresetId("ispa");
                  setIsDevModalOpen(true);
                  setActiveTab("presets");
                }}
                className="rounded-lg border border-ink/20 bg-paper px-3.5 py-2 text-xs font-medium text-ink shadow-[2px_3px_0_0_rgba(23,51,74,.06)] transition-all hover:-translate-y-px hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                🫁 Test ISPA / Batuk
              </button>
              <button
                onClick={() => {
                  setIsDevModalOpen(true);
                  setActiveTab("custom");
                }}
                className="rounded-lg border border-ink/30 bg-ink/[.04] px-3.5 py-2 text-xs font-semibold text-ink transition-all hover:-translate-y-px hover:bg-ink/[.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                ✎ Custom Sandbox
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Token Dibuat",
              value: stats.total,
              caption: "Semua riwayat token",
              icon: Key,
              valueCls: "text-ink",
              iconCls: "text-ink/60",
            },
            {
              label: "Aktif & Valid",
              value: stats.active,
              caption: "Siap digunakan pasien",
              icon: CheckCircle2,
              valueCls: "text-sah",
              iconCls: "text-sah",
            },
            {
              label: "Kadaluarsa / Off",
              value: stats.expired + stats.inactive,
              caption: `${stats.expired} kadaluarsa · ${stats.inactive} dinonaktifkan`,
              icon: Clock,
              valueCls: "text-stamp-deep",
              iconCls: "text-stamp",
            },
            {
              label: "Pasien Terhubung",
              value: stats.uniquePatients,
              caption: "Pasien unik dengan token",
              icon: Users,
              valueCls: "text-ink",
              iconCls: "text-ink-soft",
            },
          ].map(({ label, value, caption, icon: Icon, valueCls, iconCls }) => (
            <div key={label} className="rounded-xl border border-ink/20 bg-paper-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/55">{label}</span>
                <Icon className={`size-4 ${iconCls}`} />
              </div>
              <div className={`font-display text-3xl font-extrabold tracking-tight ${valueCls}`}>{value}</div>
              <p className="mt-1 text-xs italic text-ink-soft">{caption}</p>
            </div>
          ))}
        </div>

        {/* Register Table Container */}
        <div className="overflow-hidden rounded-xl border border-ink/25 bg-paper-card shadow-[8px_10px_0_-4px_rgba(23,51,74,.07)]">
          {/* Controls Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-dashed border-ink/20 p-4 sm:p-5 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                placeholder="Cari nama, NIK, diagnosis, atau kode…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputCls} pl-9 pr-8`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ink/45 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filters */}
              <div className="inline-flex rounded-lg border border-ink/20 bg-paper p-1">
                {(["ALL", "ACTIVE", "EXPIRED", "INACTIVE"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-2.5 py-1 font-code text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${statusFilter === status ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                      }`}
                  >
                    {status === "ALL" && "Semua"}
                    {status === "ACTIVE" && "Aktif"}
                    {status === "EXPIRED" && "Kadaluarsa"}
                    {status === "INACTIVE" && "Nonaktif"}
                  </button>
                ))}
              </div>

              {/* Clinic Filter */}
              <div className="relative">
                <select
                  value={clinicFilter}
                  onChange={(e) => setClinicFilter(e.target.value)}
                  aria-label="Filter poliklinik"
                  className="appearance-none rounded-lg border border-ink/20 bg-paper py-2 pl-3 pr-8 font-code text-[11px] font-semibold text-ink-soft outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  <option value="ALL">Semua Poli</option>
                  <option value="UMUM">Poli Umum</option>
                  <option value="LANSIA">Poli Lansia</option>
                  <option value="GIGI">Poli Gigi</option>
                  <option value="KIA">Poli KIA</option>
                  <option value="UGD">UGD</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-ink/45" />
              </div>
            </div>
          </div>

          {/* Tokens List / Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <RefreshCw className="size-8 animate-spin text-ink/70" />
              <p className="font-code text-xs uppercase tracking-[.18em] text-ink-soft">Memuat data token…</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg border border-ink/25 bg-paper text-ink/70">
                <Key className="size-6" />
              </div>
              <h3 className="font-display text-base font-bold">
                {tokens.length === 0 ? "Belum Ada Token Chat" : "Tidak Ada yang Cocok"}
              </h3>
              <p className="mx-auto mb-4 mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
                {tokens.length === 0
                  ? "Belum ada token post-visit yang dibuat. Buat token uji coba pertama untuk mencoba alurnya."
                  : "Coba ubah kata kunci pencarian atau filter status untuk melihat token lainnya."}
              </p>
              {tokens.length === 0 && (
                <button
                  onClick={() => {
                    setIsDevModalOpen(true);
                    setActiveTab("presets");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-ink bg-ink px-4 py-2 font-display text-xs font-bold tracking-wide text-paper shadow-[3px_4px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
                >
                  <Plus className="size-4" />
                  <span>Buat Token Uji Coba Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-ink/15 bg-paper">
                    <th className="py-3 pl-4 pr-4 font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/55 sm:pl-6">
                      Status
                    </th>
                    <th className="px-4 py-3 font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/55">
                      Pasien
                    </th>
                    <th className="px-4 py-3 font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/55">
                      Diagnosis & Rekam Medis
                    </th>
                    <th className="px-4 py-3 font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/55">
                      Token & Masa Berlaku
                    </th>
                    <th className="px-4 py-3 text-right font-code text-[10px] font-semibold uppercase tracking-[.16em] text-ink/55">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 text-sm">
                  {filteredTokens.map((item) => {
                    const expiry = getExpiryLabel(item.expiresAt, item.isActive);
                    const patient = item.rekamMedis?.pasien;
                    const diagnosis = item.rekamMedis?.diagnosis;
                    const pendaftaran = item.rekamMedis?.pendaftaran;
                    const chatUrl =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/chat/${item.token}`
                        : `/chat/${item.token}`;

                    return (
                      <tr key={item.id} className="group transition-colors hover:bg-ink/[.03]">
                        {/* Status Column */}
                        <td className="py-4 pl-4 pr-4 align-top sm:pl-6">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-code text-[10px] font-semibold ${expiry.color}`}>
                              <span className={`size-1.5 rounded-full ${expiry.dot}`} />
                              {expiry.label}
                            </span>
                            <span className="font-code text-[10px] text-ink/45">Dibuat: {formatDate(item.createdAt)}</span>
                          </div>
                        </td>

                        {/* Patient Info */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-paper font-display text-xs font-extrabold text-ink">
                              {patient?.nama ? patient.nama.charAt(0).toUpperCase() : "P"}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold leading-snug">{patient?.nama || "Nama Tidak Terdaftar"}</span>
                                <span className="rounded border border-ink/20 px-1.5 py-px font-code text-[9px] text-ink-soft">
                                  {patient?.jenisKelamin === "P" ? "Perempuan" : "Laki-laki"}
                                </span>
                              </div>
                              <div className="mt-0.5 font-code text-[11px] text-ink/55">NIK: {maskNIK(patient?.nik)}</div>
                              {patient?.noTlp && (
                                <div className="mt-0.5 font-code text-[11px] text-ink/45">Telp: {patient.noTlp}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Medical Record & Diagnosis */}
                        <td className="max-w-xs px-4 py-4 align-top">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="rounded border border-ink/20 bg-paper px-2 py-0.5 font-code text-[9px] font-semibold uppercase tracking-[.12em] text-ink-soft">
                              {pendaftaran?.poliklinik || "Poli Umum"}
                            </span>
                            {diagnosis?.kodeIcd && (
                              <span className="rounded border border-stamp/30 bg-stamp/[.06] px-1.5 py-0.5 font-code text-[9px] font-semibold text-stamp-deep">
                                ICD: {diagnosis.kodeIcd}
                              </span>
                            )}
                          </div>
                          <div className="line-clamp-1 font-medium">{diagnosis?.diagnosis || "Pemeriksaan Umum"}</div>
                          {item.rekamMedis?.anamnesis?.keluhan && (
                            <p className="mt-0.5 line-clamp-2 text-xs italic leading-relaxed text-ink-soft">
                              Keluhan: {item.rekamMedis.anamnesis.keluhan}
                            </p>
                          )}
                        </td>

                        {/* Token Details */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <code className="block max-w-[140px] truncate rounded border border-ink/20 bg-paper px-2 py-1 font-code text-[11px] font-semibold text-ink sm:max-w-[180px]">
                                {item.token}
                              </code>
                              <button
                                onClick={() => handleCopy(item.token, "token", item.id)}
                                title="Salin token"
                                className={iconBtnCls}
                              >
                                {copiedToken === item.id ? <Check className="size-3.5 text-sah" /> : <Copy className="size-3.5" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 font-code text-[10px] text-ink/45">
                              <Clock className="size-3" />
                              <span>Exp: {formatDate(item.expiresAt)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-4 text-right align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Chat Room */}
                            <Link
                              href={`/chat/${item.token}`}
                              target="_blank"
                              title="Buka ruang chat pasien"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-ink bg-ink px-3 py-1.5 font-display text-xs font-bold tracking-wide text-paper transition-all hover:-translate-y-px hover:shadow-[3px_4px_0_0_rgba(23,51,74,.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0"
                            >
                              <MessageSquare className="size-3.5" />
                              <span className="hidden sm:inline">Chat</span>
                            </Link>

                            {/* Copy Chat Link */}
                            <button
                              onClick={() => handleCopy(chatUrl, "link", item.id)}
                              title="Salin link URL chat pasien"
                              className={iconBtnCls}
                            >
                              {copiedLink === item.id ? <Check className="size-4 text-sah" /> : <ExternalLink className="size-4" />}
                            </button>

                            {/* View Medical Record Detail */}
                            <button
                              onClick={() => setSelectedRecordForDetail(item)}
                              title="Lihat detail rekam medis (konteks AI)"
                              className={iconBtnCls}
                            >
                              <FileText className="size-4" />
                            </button>

                            {/* Toggle Token Active */}
                            <button
                              onClick={() => handleToggleStatus(item)}
                              title={item.isActive ? "Nonaktifkan token" : "Aktifkan token"}
                              className={`${iconBtnCls} ${item.isActive
                                ? "hover:border-stamp/40 hover:bg-stamp/[.05] hover:text-stamp"
                                : "border-sah/40 bg-sah/[.07] text-sah hover:bg-sah/[.12]"
                                }`}
                            >
                              <Power className="size-4" />
                            </button>

                            {/* Delete Token */}
                            <button
                              onClick={() => handleDeleteToken(item.id, patient?.nama || "Pasien")}
                              title="Hapus token"
                              className={`${iconBtnCls} hover:border-stamp/40 hover:bg-stamp/[.05] hover:text-stamp`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Developer & Testing Hub Modal */}
      {isDevModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsDevModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Developer Testing & Token Generator"
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-ink/25 bg-paper-card shadow-[16px_18px_0_-6px_rgba(23,51,74,.16)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-ink/15 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-ink/25 bg-paper text-ink">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold tracking-tight">Generator Token & Skenario Uji</h3>
                  <p className="text-xs text-ink-soft">Buat rekam medis skenario lalu generate token instan untuk pengujian AI.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDevModalOpen(false)}
                aria-label="Tutup"
                className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-dashed border-ink/20 bg-paper px-5 pt-2">
              {([
                { key: "presets" as const, icon: Zap, label: "Preset Skenario Klinis" },
                { key: "custom" as const, icon: UserPlus, label: "Buat Pasien Kustom" },
                { key: "records" as const, icon: Layers, label: `Rekam Medis SIMPUS (${availableRecords.length})` },
              ]).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    if (key === "records") fetchAvailableRecords();
                  }}
                  className={`flex items-center gap-2 border-b-2 px-3 pb-3 pt-1 font-code text-[11px] font-semibold uppercase tracking-[.12em] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink ${activeTab === key ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"
                    }`}
                >
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* TAB 1: PRESETS */}
              {activeTab === "presets" && (
                <div>
                  <div className="mb-4">
                    <label className={`${labelCls} mb-2`}>1. Pilih skenario penyakit & konteks pasien</label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {DEV_PRESETS.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => setSelectedPresetId(preset.id)}
                            className={`relative rounded-lg border p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isSelected
                              ? "border-ink bg-white shadow-[4px_5px_0_-2px_rgba(23,51,74,.14)]"
                              : "border-ink/15 bg-paper hover:border-ink/40"
                              }`}
                          >
                            {isSelected && (
                              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border border-ink bg-ink text-paper">
                                <Check className="size-3" strokeWidth={3} />
                              </span>
                            )}
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{preset.icon}</span>
                                <div>
                                  <h4 className="font-display text-sm font-bold leading-snug">{preset.title}</h4>
                                  <span className="text-[11px] text-ink-soft">
                                    {preset.patientName} ({preset.gender === "L" ? "Laki-laki" : "Perempuan"})
                                  </span>
                                </div>
                              </div>
                              <span className="rounded border border-ink/20 px-2 py-0.5 font-code text-[9px] font-semibold uppercase tracking-[.12em] text-ink-soft">
                                {preset.poliklinik}
                              </span>
                            </div>

                            <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">{preset.keluhan}</p>

                            <div className="flex items-center justify-between border-t border-dashed border-ink/15 pt-2 text-[11px] text-ink-soft">
                              <span>Resep: {preset.pengobatan.length} macam obat</span>
                              <span className="font-code font-semibold text-stamp-deep">{preset.kodeIcd}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expiration Settings */}
                  <div className="mb-6 rounded-lg border border-dashed border-ink/25 bg-paper p-4">
                    <label className={`${labelCls} mb-2`}>2. Masa berlaku token</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: "1 Hari", days: 1, isExp: false },
                        { label: "7 Hari (Standar)", days: 7, isExp: false },
                        { label: "30 Hari", days: 30, isExp: false },
                        { label: "✕ Kadaluarsa (uji)", days: 0, isExp: true },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            setPresetExpiryOption(opt.days);
                            setPresetIsExpired(opt.isExp);
                          }}
                          className={`rounded-lg border py-2 px-3 font-code text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${presetExpiryOption === opt.days && presetIsExpired === opt.isExp
                            ? "border-ink bg-ink text-paper"
                            : "border-ink/20 bg-paper-card text-ink-soft hover:border-ink/40 hover:text-ink"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      disabled={isCreatingToken}
                      onClick={() => handleGeneratePreset(selectedPresetId, true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink bg-ink py-3 px-4 font-display text-sm font-bold tracking-wide text-paper shadow-[4px_5px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:opacity-50"
                    >
                      {isCreatingToken ? <RefreshCw className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                      <span>Generate Token & Buka Chat</span>
                    </button>

                    <button
                      disabled={isCreatingToken}
                      onClick={() => handleGeneratePreset(selectedPresetId, false)}
                      className="rounded-lg border border-ink/30 bg-paper py-3 px-5 text-sm font-semibold text-ink transition-colors hover:bg-ink/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
                    >
                      Simpan Token Saja
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM FORM */}
              {activeTab === "custom" && (
                <form onSubmit={handleGenerateCustom} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="cf-name" className={labelCls}>
                        Nama Pasien *
                      </label>
                      <input
                        id="cf-name"
                        type="text"
                        required
                        placeholder="Contoh: Siti Rahayu"
                        value={customForm.patientName}
                        onChange={(e) => setCustomForm({ ...customForm, patientName: e.target.value })}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="cf-nik" className={labelCls}>
                        NIK
                      </label>
                      <input
                        id="cf-nik"
                        type="text"
                        placeholder="16 digit NIK"
                        value={customForm.nik}
                        onChange={(e) => setCustomForm({ ...customForm, nik: e.target.value })}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="cf-phone" className={labelCls}>
                        No WhatsApp / HP
                      </label>
                      <input
                        id="cf-phone"
                        type="text"
                        placeholder="08123456789"
                        value={customForm.noTlp}
                        onChange={(e) => setCustomForm({ ...customForm, noTlp: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="cf-gender" className={labelCls}>
                        Jenis Kelamin
                      </label>
                      <select
                        id="cf-gender"
                        value={customForm.gender}
                        onChange={(e) => setCustomForm({ ...customForm, gender: e.target.value })}
                        className={inputCls}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cf-poli" className={labelCls}>
                        Poliklinik
                      </label>
                      <select
                        id="cf-poli"
                        value={customForm.poliklinik}
                        onChange={(e) => setCustomForm({ ...customForm, poliklinik: e.target.value })}
                        className={inputCls}
                      >
                        <option value="UMUM">Poli Umum</option>
                        <option value="LANSIA">Poli Lansia</option>
                        <option value="GIGI">Poli Gigi</option>
                        <option value="KIA">Poli KIA</option>
                        <option value="UGD">UGD</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cf-expiry" className={labelCls}>
                        Masa Berlaku Token
                      </label>
                      <select
                        id="cf-expiry"
                        value={customForm.expiresInDays}
                        onChange={(e) => setCustomForm({ ...customForm, expiresInDays: Number(e.target.value) })}
                        className={inputCls}
                      >
                        <option value={1}>1 Hari</option>
                        <option value={3}>3 Hari</option>
                        <option value={7}>7 Hari (Standar)</option>
                        <option value={14}>14 Hari</option>
                        <option value={30}>30 Hari</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cf-keluhan" className={labelCls}>
                      Keluhan / Anamnesis Pasien
                    </label>
                    <textarea
                      id="cf-keluhan"
                      rows={2}
                      placeholder="Jelaskan keluhan utama yang dirasakan pasien…"
                      value={customForm.keluhan}
                      onChange={(e) => setCustomForm({ ...customForm, keluhan: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-diagnosis" className={labelCls}>
                        Diagnosis Dokter
                      </label>
                      <input
                        id="cf-diagnosis"
                        type="text"
                        placeholder="Contoh: Gastritis Akut"
                        value={customForm.diagnosis}
                        onChange={(e) => setCustomForm({ ...customForm, diagnosis: e.target.value })}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="cf-icd" className={labelCls}>
                        Kode ICD-10
                      </label>
                      <input
                        id="cf-icd"
                        type="text"
                        placeholder="Contoh: K29.1"
                        value={customForm.kodeIcd}
                        onChange={(e) => setCustomForm({ ...customForm, kodeIcd: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="rounded-lg border border-dashed border-ink/25 bg-paper p-3">
                    <label className={labelCls}>Tanda-tanda Vital</label>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                      <div>
                        <span className="mb-1 block text-[10px] text-ink/50">Sistol (mmHg)</span>
                        <input
                          type="number"
                          value={customForm.sistol}
                          onChange={(e) => setCustomForm({ ...customForm, sistol: e.target.value })}
                          className={`${inputCls} px-2 py-1.5`}
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-[10px] text-ink/50">Diastol (mmHg)</span>
                        <input
                          type="number"
                          value={customForm.diastol}
                          onChange={(e) => setCustomForm({ ...customForm, diastol: e.target.value })}
                          className={`${inputCls} px-2 py-1.5`}
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-[10px] text-ink/50">Suhu (°C)</span>
                        <input
                          type="number"
                          step="0.1"
                          value={customForm.suhu}
                          onChange={(e) => setCustomForm({ ...customForm, suhu: e.target.value })}
                          className={`${inputCls} px-2 py-1.5`}
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-[10px] text-ink/50">Nadi (x/mnt)</span>
                        <input
                          type="number"
                          value={customForm.nadi}
                          onChange={(e) => setCustomForm({ ...customForm, nadi: e.target.value })}
                          className={`${inputCls} px-2 py-1.5`}
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-[10px] text-ink/50">Respirasi (x/mnt)</span>
                        <input
                          type="number"
                          value={customForm.respirasi}
                          onChange={(e) => setCustomForm({ ...customForm, respirasi: e.target.value })}
                          className={`${inputCls} px-2 py-1.5`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* KIE & Plan */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-kie" className={labelCls}>
                        Edukasi / KIE Dokter
                      </label>
                      <textarea
                        id="cf-kie"
                        rows={2}
                        placeholder="Contoh: Istirahat cukup, hindari makanan pedas…"
                        value={customForm.kie}
                        onChange={(e) => setCustomForm({ ...customForm, kie: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-plan" className={labelCls}>
                        Rencana / Kontrol Berikutnya
                      </label>
                      <textarea
                        id="cf-plan"
                        rows={2}
                        placeholder="Contoh: Kontrol 3 hari jika tidak membaik…"
                        value={customForm.plan}
                        onChange={(e) => setCustomForm({ ...customForm, plan: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isCreatingToken}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-ink bg-ink font-display text-sm font-bold tracking-wide text-paper shadow-[4px_5px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:opacity-50"
                    >
                      {isCreatingToken ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
                      <span>Simpan Rekam Medis & Generate Token</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: EXISTING RECORDS */}
              {activeTab === "records" && (
                <div>
                  <p className="mb-4 text-sm leading-relaxed text-ink-soft">
                    Pilih rekam medis yang sudah terdaftar di SIMPUS untuk men-generate atau memperbarui token post-visit.
                  </p>

                  {availableRecords.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-ink/25 bg-paper py-12 text-center text-sm text-ink-soft">
                      Tidak ada data rekam medis tersedia di database SIMPUS.
                    </div>
                  ) : (
                    <div className="max-h-96 divide-y divide-ink/10 overflow-y-auto rounded-xl border border-ink/20">
                      {availableRecords.map((rec) => {
                        const hasToken = !!rec.postVisit;
                        return (
                          <div
                            key={rec.id}
                            className="flex items-center justify-between gap-4 p-3.5 transition-colors hover:bg-ink/[.03]"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold">{rec.pasien?.nama || "Pasien"}</span>
                                <span className="rounded border border-ink/20 px-1.5 py-0.5 font-code text-[9px] font-semibold uppercase tracking-[.12em] text-ink-soft">
                                  {rec.pendaftaran?.poliklinik || "UMUM"}
                                </span>
                                {hasToken && (
                                  <span className="rounded border border-sah/40 bg-sah/[.08] px-1.5 py-0.5 font-code text-[9px] font-semibold text-sah">
                                    Sudah Ada Token
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 text-xs text-ink-soft">
                                NIK: <span className="font-code">{rec.pasien?.nik}</span> · Diagnosis:{" "}
                                {rec.diagnosis?.diagnosis || "-"}
                              </div>
                              <div className="mt-0.5 font-code text-[10px] text-ink/45">{formatDate(rec.createdAt)}</div>
                            </div>

                            <button
                              disabled={isCreatingToken}
                              onClick={() => handleGenerateForExistingRecord(rec.id)}
                              className="shrink-0 rounded-lg border border-ink/30 bg-paper px-3 py-1.5 font-code text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
                            >
                              {hasToken ? "Regenerate" : "Generate Token"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Inspection Drawer */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detail Rekam Medis Pasien"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-ink/25 bg-paper-card shadow-[16px_18px_0_-6px_rgba(23,51,74,.16)] animate-in zoom-in-95 duration-200"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b-2 border-ink/15 bg-paper p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-ink/25 bg-paper-card text-ink">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-display text-base font-extrabold tracking-tight">
                    <span>Rekam Medis Pasien</span>
                    <span className="font-code text-[10px] font-normal uppercase tracking-[.14em] text-ink/50">
                      (konteks yang dibaca AI)
                    </span>
                  </h3>
                  <p className="font-code text-[10px] text-ink/50">ID: {selectedRecordForDetail.rekamMedisId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                aria-label="Tutup"
                className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="space-y-6 overflow-y-auto p-6 text-sm">
              {/* Patient Identity */}
              <div className="rounded-lg border border-ink/15 bg-paper p-4">
                <h4 className="mb-3 flex items-center gap-2 font-display text-sm font-bold">
                  <User className="size-4 text-ink-soft" />
                  <span>Identitas Pasien</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ["Nama Lengkap", selectedRecordForDetail.rekamMedis?.pasien?.nama || "-", false],
                    ["NIK", selectedRecordForDetail.rekamMedis?.pasien?.nik || "-", true],
                    [
                      "Jenis Kelamin",
                      selectedRecordForDetail.rekamMedis?.pasien?.jenisKelamin === "P" ? "Perempuan" : "Laki-laki",
                      false,
                    ],
                    ["No Telepon / WhatsApp", selectedRecordForDetail.rekamMedis?.pasien?.noTlp || "-", true],
                    ["Poliklinik", selectedRecordForDetail.rekamMedis?.pendaftaran?.poliklinik || "UMUM", true],
                  ].map(([label, value, mono]) => (
                    <div key={String(label)}>
                      <span className="mb-0.5 block font-code text-[9px] uppercase tracking-[.14em] text-ink/45">{label}</span>
                      <span className={`font-medium ${mono ? "font-code text-[13px]" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anamnesis & Vitals */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-ink/15 bg-paper p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
                    <Activity className="size-4 text-stamp" />
                    <span>Anamnesis & Keluhan</span>
                  </h4>
                  <p className="leading-relaxed text-ink-soft">
                    {selectedRecordForDetail.rekamMedis?.anamnesis?.keluhan || "Tidak ada keluhan spesifik."}
                  </p>
                </div>

                <div className="rounded-lg border border-ink/15 bg-paper p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
                    <Stethoscope className="size-4 text-ink-soft" />
                    <span>Tanda-tanda Vital</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="mb-0.5 block font-code text-[9px] uppercase tracking-[.14em] text-ink/45">Tekanan Darah</span>
                      <span className="font-code font-semibold">
                        {selectedRecordForDetail.rekamMedis?.pemeriksaan?.sistol || "-"}/
                        {selectedRecordForDetail.rekamMedis?.pemeriksaan?.diastol || "-"} mmHg
                      </span>
                    </div>
                    <div>
                      <span className="mb-0.5 block font-code text-[9px] uppercase tracking-[.14em] text-ink/45">Suhu Tubuh</span>
                      <span className="font-code font-semibold">{selectedRecordForDetail.rekamMedis?.pemeriksaan?.suhu || "-"} °C</span>
                    </div>
                    <div>
                      <span className="mb-0.5 block font-code text-[9px] uppercase tracking-[.14em] text-ink/45">Nadi</span>
                      <span className="font-code">{selectedRecordForDetail.rekamMedis?.pemeriksaan?.nadi || "-"} x/mnt</span>
                    </div>
                    <div>
                      <span className="mb-0.5 block font-code text-[9px] uppercase tracking-[.14em] text-ink/45">Respirasi</span>
                      <span className="font-code">{selectedRecordForDetail.rekamMedis?.pemeriksaan?.respirasi || "-"} x/mnt</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="rounded-lg border border-ink/15 bg-paper p-4">
                <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
                  <Shield className="size-4 text-sah" />
                  <span>Diagnosis Medis</span>
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">
                    {selectedRecordForDetail.rekamMedis?.diagnosis?.diagnosis || "Pemeriksaan Kesehatan"}
                  </span>
                  {selectedRecordForDetail.rekamMedis?.diagnosis?.kodeIcd && (
                    <span className="rounded border border-stamp/30 bg-stamp/[.06] px-2 py-0.5 font-code text-[10px] font-semibold text-stamp-deep">
                      ICD-10: {selectedRecordForDetail.rekamMedis.diagnosis.kodeIcd}
                    </span>
                  )}
                </div>
              </div>

              {/* Medication Prescribed */}
              <div className="rounded-lg border border-ink/15 bg-paper p-4">
                <h4 className="mb-3 flex items-center gap-2 font-display text-sm font-bold">
                  <Pill className="size-4 text-ink-soft" />
                  <span>Resep & Obat yang Diberikan</span>
                </h4>

                {Array.isArray(selectedRecordForDetail.rekamMedis?.pengobatan?.pengobatan) &&
                  selectedRecordForDetail.rekamMedis.pengobatan.pengobatan.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRecordForDetail.rekamMedis.pengobatan.pengobatan.map((obat, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between gap-1 rounded-lg border border-ink/15 bg-paper-card px-3 py-2.5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <span className="font-semibold">{obat.namaObat || obat.nama || `Obat #${idx + 1}`}</span>
                          <span className="ml-2 font-code text-[11px] text-ink/50">({obat.jumlah || "-"})</span>
                        </div>
                        <div className="text-xs text-ink-soft">
                          <span>Dosis: {obat.dosis || "-"}</span> •{" "}
                          <span className="font-medium text-ink">{obat.aturanPakai || obat.caraPakai || "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-ink/50">Tidak ada rincian obat tertulis.</p>
                )}
              </div>

              {/* KIE / Doctor Instructions */}
              <div className="rounded-lg border border-ink/15 bg-paper p-4">
                <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
                  <Heart className="size-4 text-stamp" />
                  <span>Komunikasi, Informasi, & Edukasi (KIE) Dokter</span>
                </h4>
                <p className="leading-relaxed text-ink-soft">
                  {selectedRecordForDetail.rekamMedis?.pulangRujuk?.kie ||
                    "Minum obat sesuai anjuran dan istirahat yang cukup."}
                </p>
                {selectedRecordForDetail.rekamMedis?.pulangRujuk?.plan && (
                  <div className="mt-2 border-t border-dashed border-ink/15 pt-2 text-xs text-ink-soft">
                    <span className="font-semibold text-ink">Rencana Tindak Lanjut: </span>
                    {selectedRecordForDetail.rekamMedis.pulangRujuk.plan}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between gap-3 border-t-2 border-ink/15 bg-paper p-4">
              <button
                onClick={() =>
                  handleCopy(
                    `${window.location.origin}/chat/${selectedRecordForDetail.token}`,
                    "link",
                    selectedRecordForDetail.id
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-ink/30 bg-paper-card px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-ink/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Copy className="size-3.5" />
                <span>Salin Link Chat</span>
              </button>

              <Link
                href={`/chat/${selectedRecordForDetail.token}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg border border-ink bg-ink px-5 py-2 font-display text-xs font-bold tracking-wide text-paper shadow-[3px_4px_0_0_rgba(23,51,74,.25)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <MessageSquare className="size-3.5" />
                <span>Buka Chat Pasien Ini</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
