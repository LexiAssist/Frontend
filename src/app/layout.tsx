import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LexiAssist | AI-Powered Learning for Everyone",
  description: "AI-powered learning assistant designed to make reading, studying, and writing easier for students who learn differently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
