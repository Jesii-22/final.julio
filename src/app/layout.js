import { Geist, Geist_Mono } from "next/font/google";

import CommerceBenefitsBar from "@/components/CommerceBenefitsBar";
import Navbar from "@/components/Navbar";
import { GlobalProvider } from "@/context/GlobalContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mutuo | Objetos funcionales",
  description:
    "Objetos funcionales impresos en 3D para simplificar y organizar tu hogar.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <GlobalProvider>
          <Navbar />

          <CommerceBenefitsBar />

          <main className="flex-1">
            {children}
          </main>
        </GlobalProvider>
      </body>
    </html>
  );
}