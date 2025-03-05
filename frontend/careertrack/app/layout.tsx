import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CareerTrack - AI-Powered Career Development Platform",
    template: "%s | CareerTrack"
  },
  description: "Your AI-powered career development companion. Optimize resumes for ATS systems, practice mock interviews, generate skill assessments, and accelerate your job search with intelligent career guidance. For job seekers and professionals.",
  keywords: [
    "career development",
    "ATS resume optimization",
    "AI mock interviews",
    "job search tools",
    "career coaching",
    "resume builder",
    "interview preparation",
    "skills assessment"
  ],
  
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
              <Navbar />

        {children}
        <Footer />

      </body>
    </html>
  );
}
