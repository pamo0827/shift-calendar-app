import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SecurityProvider } from "@/components/security-provider"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shif-Post - シフト管理アプリ",
  description: "効率的なシフト管理とカレンダー連携",
  robots: "noindex, nofollow", // 開発中はクローラーをブロック
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SecurityProvider>{children}</SecurityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
