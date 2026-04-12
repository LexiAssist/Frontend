import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LexiAssist | AI-Powered Learning for Everyone",
  description: "AI-powered learning assistant designed to make reading, studying, and writing easier for students who learn differently.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#3c8350",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <ThemeProvider defaultTheme="light" enableSystem>
          <QueryProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <ToastContainer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
