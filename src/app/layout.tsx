import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Preloader } from "@/components/Preloader";

export const metadata: Metadata = {
  title: "Project Proofy • by Dmytro Usoltsev",
  description: "Neon proof-of-work gallery curated and engineered by Dmytro Usoltsev.",
  applicationName: "Project Proofy",
  authors: [{ name: "Dmytro Usoltsev" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
