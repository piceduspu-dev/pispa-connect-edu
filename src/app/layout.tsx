import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import MaintenancePage from "@/components/MaintenancePage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PISPA Connect - Under Maintenance",
  description: "PISPA Connect is currently undergoing scheduled maintenance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        {/* Background Image */}
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-fixed -z-10"
          style={{ backgroundImage: 'url(/background.jpeg)' }}
        />

        {/* Overlay for readability */}
        <div className="fixed inset-0 w-full h-full bg-white/80 -z-10" />

        <AuthProvider>
          <MaintenancePage />
          {/* {children} - Disabled for maintenance */}
        </AuthProvider>
      </body>
    </html>
  );
}
