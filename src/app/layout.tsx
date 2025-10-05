import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import ErrorBoundary from "@/components/ErrorBoundary";
import dynamic from "next/dynamic";

// Lazy load non-critical components for better initial load performance
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt"), {
  ssr: false,
});
const OfflineIndicator = dynamic(() => import("@/components/OfflineIndicator"), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Academic Insight PWA",
  description: "Dashboard analisis kinerja program studi untuk dosen dan administrator universitas",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Academic Insight",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
              <InstallPrompt />
              <OfflineIndicator />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
