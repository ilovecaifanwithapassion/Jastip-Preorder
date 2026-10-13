import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legal & Ketentuan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Syarat & Ketentuan Layanan (Terms of Service)
        </h1>
        <p className="text-xs text-slate-500">Terakhir diperbarui: 13 Oktober 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Definisi Layanan Jastip</h2>
          <p>
            JastipPreorder adalah penyedia layanan jasa titip pembelian barang pribadi (personal shopper) di luar negeri. Kami bertindak atas nama dan instruksi pemesan (pelanggan) untuk membeli barang legal yang tersedia di gerai resmi negara tujuan belanja.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Penetapan Harga & Kurs Konversi</h2>
          <p>
            Semua harga katalog yang ditampilkan dalam mata uang Rupiah (IDR) merupakan estimasi berdasarkan nilai tukar devisa real-time saat penjelajahan. Saat pemesanan diselesaikan dan dikonfirmasi, nilai tukar kurs serta rincian biaya jastip akan dikunci (snapshot) dan tidak akan berubah akibat fluktuasi kurs berikutnya.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Ketersediaan Barang & Pembatalan</h2>
          <p>
            Pembelian barang bergantung pada ketersediaan stok fisik di gerai atau butik luar negeri pada tanggal jadwal trip. Apabila barang tidak tersedia di gerai resmi, pemesan berhak mendapatkan pengembalian dana penuh (100% refund) atas produk yang tidak berhasil terbeli.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Pajak, Cukai, & Ketentuan Impor</h2>
          <p>
            Semua barang yang dititipkan tunduk pada peraturan kepabeanan dan ketentuan impor barang bawaan penumpang di Republik Indonesia. Barang terlarang, berbahaya, atau melanggar hukum tidak dapat dititipkan melalui layanan kami.
          </p>
        </section>
      </div>
    </div>
  );
}
