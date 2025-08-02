import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
import { CookieBanner } from "@/components/CookieBanner"
import { GoogleAnalytics } from "@/components/GoogleAnalytics"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  // Enhanced Primary SEO Tags
  title: "Recruit My Game: The Future of Athletic Recruitment",
  description:
    "Showcase your complete athletic story, game film, verified coach reviews, and more. Recruit My Game is the all-in-one platform for student-athletes to stand out to college coaches.",
  keywords: [
    "athletic recruitment",
    "student-athlete",
    "sports profile",
    "recruiting platform",
    "game film",
    "coach reviews",
    "NCAA",
    "NAIA",
    "athletic scholarships",
    "sports highlights",
    "college recruitment",
  ],
  authors: [{ name: "Recruit My Game Team" }],
  creator: "Recruit My Game",
  publisher: "RecruitMyGame",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmygame.com"),
  alternates: {
    canonical: "/",
  },

  // Open Graph (OG) Tags for Social Media
  openGraph: {
    title: "Recruit My Game: The Future of Athletic Recruitment",
    description:
      "Showcase your complete athletic story, game film, verified coach reviews, and more. Recruit My Game is the all-in-one platform for student-athletes to stand out to college coaches.",
    url: "https://www.recruitmygame.com", // Replace with your live URL
    siteName: "Recruit My Game",
    images: [
      {
        url: "https://www.recruitmygame.com/og-image.jpg", // Replace with an actual, high-quality image URL
        width: 1200,
        height: 630,
        alt: "Recruit My Game: The Future of Athletic Recruitment",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card Tags
  twitter: {
    card: "summary_large_image",
    title: "Recruit My Game: The Future of Athletic Recruitment",
    description:
      "Showcase your complete athletic story, game film, verified coach reviews, and more. Recruit My Game is the all-in-one platform for student-athletes to stand out to college coaches.",
    creator: "@RecruitMyGame", // Replace with your Twitter handle
    images: ["https://www.recruitmygame.com/twitter-image.jpg"], // Replace with an actual, high-quality image URL
  },
   robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
  
}>) {
   const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID
  return (
    <html lang="en">
        <head>
        {/* Google Analytics */}
        {gaTrackingId && <GoogleAnalytics trackingId={gaTrackingId} />}
      </head>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}