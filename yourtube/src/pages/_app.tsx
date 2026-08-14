import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import Script from "next/script";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <UserProvider>
      <div className="h-screen w-full overflow-hidden">
        <title>Your-Tube Clone</title>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Toaster />
        <div className="flex h-[calc(100vh-4rem)] w-full">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {sidebarOpen && (
            <div
              className="fixed inset-0 top-16 bg-black/40 md:hidden z-40 "
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden ">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
