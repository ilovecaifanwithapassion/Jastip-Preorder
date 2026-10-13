import React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, MessageCircle } from "lucide-react";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";

export default function FAQPage() {
  const whatsappUrl = getWhatsAppSupportUrl({ type: "GENERAL" });

  const faqs = [
    {
      q: "Apa itu JastipPreorder?",
      a: "JastipPreorder adalah platform belanja jasa titip berbasis trip perjalanan. Pemilik bisnis (owner) merencanakan jadwal belanja ke negara tertentu, membuka pre-order produk, membeli langsung di toko resmi luar negeri, dan membawanya kembali ke Indonesia untuk dikirim ke rumah Anda.",
    },
    {
      q: "Apakah harga produk sudah termasuk ongkir lokal ke alamat saya?",
      a: "Biaya yang tertera saat checkout mencakup harga barang di luar negeri dan jasa titip (service fee). Biaya ongkir pengiriman kurir lokal di Indonesia (JNE, J&T, SiCepat, atau kurir instan) dapat dikoordinasikan atau ditagihkan sesuai berat dan alamat akhir.",
    },
    {
      q: "Bagaimana cara kerja konversi kurs real-time?",
      a: "Website terhubung langsung dengan penyedia data nilai tukar devisa real-time (Frankfurter/ECB). Harga barang dalam mata uang negara asal (seperti SGD, JPY, USD) secara otomatis dikonversi ke Rupiah (IDR). Saat Anda memesan, nilai kurs tersebut dibekukan (locked) pada invoice pesanan Anda sehingga Anda tidak terpengaruh naik-turunnya kurs kemudian.",
    },
    {
      q: "Bagaimana cara melakukan pembayaran?",
      a: "Saat ini kami mendukung metode pembayaran transfer bank manual (BCA) dan QRIS. Setelah checkout, Anda akan mendapatkan petunjuk nomor rekening dan nomor order unik. Unggah bukti transfer di halaman pesanan Anda agar admin dapat segera memverifikasinya.",
    },
    {
      q: "Bisa titip barang yang tidak ada di katalog?",
      a: "Tentu saja! Anda dapat menggunakan fitur 'Custom Request' untuk memasukkan nama produk, foto referensi, dan link produk luar negeri yang Anda inginkan. Admin akan meninjau dan memberikan penawaran harga (quote) khusus untuk Anda.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Bantuan Pelanggan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-sm text-slate-500">
          Semua informasi penting seputar pemesanan, kurs, dan pembayaran jastip
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 rounded-2xl glass-panel space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
              <span className="text-indigo-600 font-extrabold">{idx + 1}.</span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* Support Banner */}
      <div className="p-8 rounded-3xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-indigo-950 text-lg">Punya Pertanyaan Lain?</h3>
          <p className="text-xs sm:text-sm text-indigo-700 mt-1">
            Hubungi kami langsung melalui WhatsApp untuk konsultasi belanja jastip Anda.
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md flex-shrink-0 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat WhatsApp Admin</span>
        </a>
      </div>
    </div>
  );
}
