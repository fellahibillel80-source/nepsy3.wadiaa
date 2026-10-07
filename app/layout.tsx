import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { GenderThemeProvider } from "@/components/gender-theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "ÉFLo(IMC) | النيبسي التفاعلية للأطفال",
  description: "ÉFLo(IMC) - Évaluation des fonctions cognitives et du langage oral chez les enfants atteints d'IMC",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  font-size: 18px;
}
        `}</style>
      </head>
      <body>
        <GenderThemeProvider>{children}</GenderThemeProvider>
      </body>
    </html>
  )
}
