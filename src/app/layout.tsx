import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clínica de Ortodoncia",
    template: "%s · Clínica de Ortodoncia",
  },
  description: "Sistema de agendamiento de citas y seguimiento de tratamientos de ortodoncia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
