import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Add a professional font
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip"; // 2. Required for Sidebar tooltips

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bells University - Course Allocation System",
  description: "Automated lecturer and course allocation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 3. Apply the font class and 'antialiased' for cleaner text */}
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}