"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ArrowLeft,
  Package,
  Link as LinkIcon,
} from "lucide-react";

function CustomRequestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const tripId = searchParams.get("tripId") || "";
  const defaultProductName = searchParams.get("productName") || "";

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    tripId,
    productName: defaultProductName,
    description: "",
    referenceUrl: "",
    quantity: "1",
    variantSpecs: "",
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?redirect=/custom-request${tripId ? `?tripId=${tripId}` : ""}`);
    }
  }, [authStatus, router, tripId]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/trips")
        .then((r) => r.json())
        .then((data) => setTrips(Array.isArray(data) ? data.filter((t: any) => t.status === "OPEN" || t.status === "PUBLISHED") : []))
        .catch(() => setTrips([]))
        .finally(() => setLoading(false));
    }
  }, [authStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tripId || !form.productName || !form.description) {
      setError("Harap isi semua field yang diperlukan."); return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim request.");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-emerald-200 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Request Dikirim!</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Admin kami akan mereview permintaan Anda dan memberikan penawaran harga. Pantau di riwayat pesanan Anda.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setSubmitted(false); setForm({ tripId, productName: "", description: "", referenceUrl: "", quantity: "1", variantSpecs: "" }); }}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              Ajukan Request Lain
            </button>
            <Link href="/orders" className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-indigo-300 transition-colors">
              Lihat Pesanan Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link href="/trips" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Trips
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-600">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Custom Request</h1>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Titipkan barang spesifik yang tidak ada dalam katalog kami. Kami akan memberikan penawaran harga terbaik.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {/* Trip Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Pilih Trip <span className="text-red-500">*</span>
          </label>
          <select
            value={form.tripId}
            onChange={(e) => setForm((prev) => ({ ...prev, tripId: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm bg-white"
            required
          >
            <option value="">-- Pilih Trip --</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} · {t.destinationCity}, {t.destinationCountry}
              </option>
            ))}
          </select>
          {trips.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Belum ada trip yang terbuka. Hubungi admin via WhatsApp.
            </p>
          )}
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
            placeholder="Contoh: Laneige Lip Sleeping Mask, Nike Air Max 270"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Deskripsi & Spesifikasi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm resize-none"
            placeholder="Jelaskan spesifikasi produk yang Anda inginkan. Ukuran, warna, varian, kemasan, dll."
            required
          />
        </div>

        {/* Reference URL */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Link Referensi Produk (opsional)
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={form.referenceUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, referenceUrl: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              placeholder="https://shopee.sg/product/..."
            />
          </div>
        </div>

        {/* Variant Specs */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Spesifikasi Varian (opsional)
          </label>
          <input
            type="text"
            value={form.variantSpecs}
            onChange={(e) => setForm((prev) => ({ ...prev, variantSpecs: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
            placeholder="Contoh: Ukuran L, warna biru navy, 100ml"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Jumlah</label>
          <input
            type="number"
            min="1"
            max="20"
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            className="w-32 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
          />
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 space-y-1">
          <p className="font-bold">ℹ️ Cara Kerja Custom Request:</p>
          <ol className="list-decimal ml-4 space-y-0.5">
            <li>Anda submit request di sini</li>
            <li>Admin mereview dan memberikan penawaran harga</li>
            <li>Jika setuju, Anda konfirmasi dan lanjut ke pembayaran</li>
            <li>Admin membelikan barang untuk Anda di sana</li>
          </ol>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : <><Tag className="w-4 h-4" />Kirim Custom Request</>}
        </button>
      </form>

      {/* WhatsApp Alternative */}
      <a
        href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20mengajukan%20custom%20request"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
      >
        <MessageCircle className="w-7 h-7 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-emerald-800 text-sm">Atau Chat Langsung via WhatsApp</p>
          <p className="text-xs text-emerald-600">Untuk diskusi lebih detail tentang produk yang Anda inginkan</p>
        </div>
      </a>
    </div>
  );
}

export default function CustomRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <CustomRequestContent />
    </Suspense>
  );
}
