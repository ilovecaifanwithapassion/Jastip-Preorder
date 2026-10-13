import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Kebijakan Pengembalian Dana</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Kebijakan Pembatalan & Pengembalian Dana (Refund Policy)
        </h1>
        <p className="text-xs text-slate-500">Terakhir diperbarui: 13 Oktober 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-900 font-medium text-xs">
            Komitmen Kami: Jika barang yang Anda pesan habis di toko luar negeri, dana Anda akan dikembalikan 100% tanpa potongan biaya layanan.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Barang Habis di Toko (Out of Stock)</h2>
          <p>
            Jika traveler telah mendatangi gerai resmi dan barang dinyatakan habis/tidak tersedia, traveler akan memberikan notifikasi status &quot;Out of Stock&quot;. Seluruh nilai pembayaran barang dan biaya jastip atas barang tersebut akan dikembalikan secara penuh dalam kurun waktu 1-3 hari kerja setelah konfirmasi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Pembatalan oleh Pelanggan</h2>
          <p>
            Pembatalan pesanan oleh pelanggan dapat dilakukan sebelum batas waktu &quot;Order Deadline&quot; trip berakhir. Setelah batas waktu berakhir atau status order berubah menjadi &quot;Purchasing in Progress&quot; atau &quot;Purchased&quot;, pesanan tidak dapat dibatalkan secara sepihak.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Barang Rusak atau Cacat Pembelian</h2>
          <p>
            Traveler melakukan pengecekan fisik (quality check) saat membeli produk di toko. Namun jika terjadi kerusakan dalam proses hand-carry atau pengiriman domestik, pelanggan wajib menyertakan video unboxing utuh tanpa jeda maksimal 1x24 jam sejak paket diterima untuk pengajuan investigasi dan kompensasi.
          </p>
        </section>
      </div>
    </div>
  );
}
