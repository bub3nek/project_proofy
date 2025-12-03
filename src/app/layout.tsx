import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Preloader } from "@/components/Preloader";

export const metadata: Metadata = {
  title: "Project Proofy",
  description: "Retro Pixel Cyberpunk Work Gallery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Preloader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
