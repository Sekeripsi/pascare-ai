import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Pascare.ai",
  description: "Dashboard Manajemen Token & Pengujian AI Pasca Kunjungan Pasien",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
