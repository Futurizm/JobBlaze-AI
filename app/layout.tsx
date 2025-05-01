import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { XPProvider } from "@/components/xp-provider"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/router"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobBlaze AI - Your AI-Powered Job Search Assistant",
  description: "Find your dream job with the help of AI",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Note: useRouter can't be used directly in app directory; this is for illustration.
  // Use a client component or alternative method to get pathname if needed.
  const isResumeEnhancer = typeof window !== 'undefined' && window.location.pathname === '/resume-enhancer';

  return (
    <html lang="en" className="light" style={{ overflowX: 'hidden', colorScheme: 'light' }}>
      <body className={inter.className} style={{ overflowX: 'hidden' }}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <XPProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex-1 overflow-auto w-full !p-0">
                  <Navbar />
                  <main className={`page-container w-full max-w-full box-border ${isResumeEnhancer ? '!px-0' : 'px-4 md:px-6 lg:px-8'}`}>
                    {children}
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </XPProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}