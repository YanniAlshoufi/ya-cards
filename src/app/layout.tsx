import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Web App",
  description: "Description here.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <TRPCReactProvider>
        <html lang="en">
          <body
            className={`${geist.variable} dark min-h-dvh bg-gray-800 antialiased`}
          >
            <header className="flex h-16 items-center justify-end gap-4 bg-gray-900 p-4">
              <Link href="/" className="hover:scale-95">
                Home
              </Link>
            </header>
            {children}

            <Toaster />
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
