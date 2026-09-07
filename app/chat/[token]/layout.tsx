import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ruang Konsultasi | Pascare.ai",
  description: "Tanya jawab dengan asisten Pascare.ai berdasarkan catatan pemeriksaan Anda.",
};

export default function ChatTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
