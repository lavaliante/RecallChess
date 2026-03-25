import type { Metadata } from "next";
import { SoundProvider } from "@/components/sound-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecallChess",
  description: "A minimal chess memory trainer built with Next.js and chess.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
