// app/layout.tsx or RootLayout.tsx
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto } from '@next/font/google'; // Import Google Font
import "./globals.css";
import Navbar from '../components/Navbar';
import '@fontsource/inter/400.css'; // Regular
import '@fontsource/inter/700.css'; // Bold

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Use the Roboto font
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "Your Anime",
  description: "Your Anime website for all things anime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar/>
            {children}
          </ThemeProvider>
        </body>
      </html>
  );
}
