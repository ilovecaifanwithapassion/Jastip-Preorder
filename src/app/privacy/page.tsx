import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Privasi & Perlindungan Data</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Kebijakan Privasi (Privacy Policy)
        </h1>
        <p className="text-xs text-slate-500">Terakhir diperbarui: 13 Oktober 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Data yang Dikumpulkan</h2>
          <p>
            Kami hanya mengumpulkan data yang esensial untuk memproses pesanan dan pengiriman jastip Anda, antara lain: Nama lengkap, alamat pengiriman barang, nomor WhatsApp/telepon untuk koordinasi pengiriman, serta bukti pembayaran transfer bank.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Keamanan & Penggunaan Informasi</h2>
          <p>
            Kata sandi Anda disimpan dengan enkripsi satu arah (bcrypt). Data pribadi Anda tidak pernah dijual atau diserahkan kepada pihak ketiga di luar kebutuhan ekspedisi pengiriman paket kurir lokal.
          </p>
        </section>
      </div>
    </div>
  );
}
