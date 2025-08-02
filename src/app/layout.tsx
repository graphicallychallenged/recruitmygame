import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

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
  metadataBase: new URL("https://www.recruitmygame.com"), // Replace with your live domain

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}