import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusAI - Find Your Perfect AI Model",
  description:
    "Discover, compare, and deploy AI models through guided conversations. Browse 525+ AI models from top providers including OpenAI, Anthropic, Google, and Meta.",
  keywords: [
    "AI models",
    "machine learning",
    "AI marketplace",
    "model discovery",
    "AI comparison",
    "OpenAI",
    "Anthropic",
    "Google AI",
    "Meta AI",
  ],
  authors: [{ name: "NexusAI" }],
  openGraph: {
    title: "NexusAI - Find Your Perfect AI Model",
    description:
      "Discover, compare, and deploy AI models through guided conversations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
