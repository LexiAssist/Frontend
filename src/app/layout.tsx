import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TokenRefreshProvider } from "@/components/providers/TokenRefreshProvider";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
      <body className={`${roboto.className} bg-slate-50 text-slate-900 antialiased`}>
        <ThemeProvider defaultTheme="light" enableSystem>
          <TokenRefreshProvider>
            <QueryProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <ToastContainer />
            </QueryProvider>
          </TokenRefreshProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}