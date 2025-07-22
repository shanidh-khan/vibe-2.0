import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/provider"
import AuthCheck from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MockAPI Platform",
  description: "A powerful mock API platform similar to Postman",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Providers>
          <AuthCheck>{children}</AuthCheck>
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
