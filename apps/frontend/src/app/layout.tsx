import type { ReactNode } from "react";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import "./globals.css";

// Onest — основной гротеск с полной кириллицей (тело + русские заголовки).
const fontSans = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Bricolage Grotesque — характерный дисплейный шрифт для латиницы:
// логотип и крупные денежные суммы. Кириллица доезжает фолбэком на --font-sans.
const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Expence Tracker",
  description: "Track your expenses",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
