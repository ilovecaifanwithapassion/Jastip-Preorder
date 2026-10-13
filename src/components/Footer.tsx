import React from "react";
import Link from "next/link";
import { Plane, ShieldCheck, RefreshCw, MessageCircle } from "lucide-react";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";

export function Footer() {
  const whatsappUrl = getWhatsAppSupportUrl({ type: "GENERAL" });

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                JastipPreorder
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Layanan personal shopping (jasa titip) terpercaya. Dapatkan produk impian dari berbagai negara dengan harga transparan dan konversi kurs real-time.
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Jelajahi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/trips" className="hover:text-white transition-colors">
                  Daftar Shopping Trips
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link href="/custom-request" className="hover:text-white transition-colors">
                  Ajukan Titip Barang Khusus
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Keranjang Belanja
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Informasi & Kebijakan
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ & Cara Kerja Jastip
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Syarat & Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Kebijakan Pembatalan & Refund
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Jaminan Keamanan
            </h4>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">100% Produk Original</p>
                <p className="text-[11px] text-slate-400">
                  Semua barang dibeli langsung dari gerai resmi atau butik store di luar negeri.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <RefreshCw className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Kurs Transparan & Live</p>
                <p className="text-[11px] text-slate-400">
                  Estimasi harga menggunakan kurs devisa real-time tanpa biaya tersembunyi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JastipPreorder. Hak cipta dilindungi undang-undang.</p>
          <p className="text-[11px]">
            Catatan: Harga yang tertera adalah estimasi berdasarkan nilai tukar pasar aktif dan biaya jastip terkonfigurasi.
          </p>
        </div>
      </div>
    </footer>
  );
}
