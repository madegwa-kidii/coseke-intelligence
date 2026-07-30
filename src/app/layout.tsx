import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { AuthProvider } from "@/lib/auth-context";
import InstallPrompt from "@/components/InstallPrompt";
import {Header} from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// -----------------
// Viewport
// -----------------
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  colorScheme: "light dark",
};

// -----------------
// Metadata
// -----------------
export const metadata: Metadata = {
  metadataBase: new URL("https://coseke-intelligence.vercel.app"),

  title: {
    default: "Coseke Intelligence — Employee Check-In & Check-Out",
    template: "%s | Coseke Intelligence",
  },
  description:
      "Coseke Intelligence is a facial recognition attendance app for Coseke staff across East Africa. Check in and check out in seconds — no cards, no PINs.",

  applicationName: "Coseke Intelligence",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: [
    "Coseke Intelligence",
    "Coseke attendance",
    "facial recognition check-in",
    "employee attendance app",
    "Coseke staff app",
    "East Africa HR tech",
  ],

  authors: [{ name: "Coseke" }],
  creator: "Coseke",
  publisher: "Coseke",

  // Public-facing: allow indexing so branches can find & install it
  robots: {
    index: true,
    follow: true,
  },

  // -----------------
  // Icons
  // -----------------
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  // -----------------
  // Open Graph (link previews on WhatsApp, Slack, Teams, etc.)
  // -----------------
  openGraph: {
    type: "website",
    url: "https://coseke-intelligence.vercel.app/",
    title: "Coseke Intelligence — Employee Check-In & Check-Out",
    description:
        "Facial recognition attendance app for Coseke staff. Check in and check out in seconds, from any branch.",
    siteName: "Coseke Intelligence",
    images: [
      {
        url: "https://coseke-intelligence.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Coseke Intelligence",
      },
    ],
  },

  // -----------------
  // Twitter Card
  // -----------------
  twitter: {
    card: "summary_large_image",
    title: "Coseke Intelligence — Employee Check-In & Check-Out",
    description:
        "Facial recognition attendance app for Coseke staff across East Africa.",
    images: ["https://coseke-intelligence.vercel.app/logo.png"],
  },

  alternates: {
    canonical: "https://coseke-intelligence.vercel.app/",
  },

  appleWebApp: {
    capable: true,
    title: "Coseke Intel",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

// -----------------
// Root Layout
// -----------------
export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          dir="ltr"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
          suppressHydrationWarning
      >
      <body className="min-h-full flex flex-col">
      <SessionProvider>
        <AuthProvider>
          <Header />
          {children}
          <InstallPrompt />
        </AuthProvider>
      </SessionProvider>
      </body>
      </html>
  );
}
