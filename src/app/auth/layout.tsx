import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Academic Insight PWA",
  description: "Login ke dashboard analisis kinerja program studi",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}