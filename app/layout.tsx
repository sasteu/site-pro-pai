import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // MUDANÇA 1: Importamos nossa Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// MUDANÇA 2: Atualizamos o título e a descrição
export const metadata: Metadata = {
  title: "Controle do Contador",
  description: "Dashboard para gestão de obrigações",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // MUDANÇA 3: Alteramos o idioma para português
    <html lang="pt-br">
      <body
        // MUDANÇA 4: Mantemos as classes da fonte e adicionamos as nossas de estilo
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
      >
        <Navbar /> {/* MUDANÇA 5: Adicionamos a Navbar aqui */}
        <main>
          {children} {/* O conteúdo da página (nosso dashboard) aparecerá aqui */}
        </main>
      </body>
    </html>
  );
}