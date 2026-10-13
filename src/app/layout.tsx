import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "JastipPreorder - Trip-Based Personal Shopping Service",
  description:
    "Jasa titip belanja luar negeri terpercaya. Ikuti shopping trip ke Singapura, Jepang, Korea, dan negara lainnya dengan estimasi kurs live real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
