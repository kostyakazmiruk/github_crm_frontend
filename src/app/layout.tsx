"use client"
import "./globals.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient()


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
    <body suppressHydrationWarning={true}>
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white">{children}</div>
    </QueryClientProvider>
    </body>
    </html>
  );
}
