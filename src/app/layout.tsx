import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { EmotionRecordProvider } from "@/contexts/emotion-record-context";
import { TeamProvider } from "@/contexts/team-context";
// 🚀 Importando o AuthProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgileMood",
  description: "Sua plataforma de promoção de segurança psicológica e bem-estar no trabalho",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 🌟 Envolvendo a aplicação com AuthProvider */}
        <AuthProvider>  <EmotionRecordProvider>
            <TeamProvider>
              {children}
            </TeamProvider>
          </EmotionRecordProvider></AuthProvider>
      </body>
    </html>
  );
}
