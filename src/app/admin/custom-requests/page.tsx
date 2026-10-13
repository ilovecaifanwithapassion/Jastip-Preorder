"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  DollarSign,
  Calendar,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  Send,
} from "lucide-react";

interface CustomRequestItem {
  id: string;
  productName: string;
  description: string;
  referenceUrl: string | null;
  referenceImage: string | null;
  quantity: number;
  variantSpecs: string | null;
  status: string;
  quotedOriginalPrice: number | null;
  quotedCustomerPrice: number | null;
  quotedServiceFee: number | null;
  quoteNotes: string | null;
  quoteExpiresAt: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  trip: {
    title: string;
    destinationCity: string;
    purchaseCurrency: string;
  };
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  SUBMITTED: { label: "Menunggu Review", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  UNDER_REVIEW: { label: "Sedang Dicek", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  QUOTED: { label: "Diberi Harga (Quoted)", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  ACCEPTED: { label: "Disetujui Pelanggan", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  DECLINED: { label: "Ditolak", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  CONVERTED_TO_ORDER: { label: "Jadi Order", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
};

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [quotingItem, setQuotingItem] = useState<CustomRequestItem | null>(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    quotedOriginalPrice: "",
    quotedServiceFee: "",
    quotedCustomerPrice: "",
    quoteNotes: "",
    quoteExpiresAt: "",
  });
  const [savingQuote, setSavingQuote] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/custom-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openQuoteModal = (req: CustomRequestItem) => {
    setQuotingItem(req);
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 3);

    setQuoteForm({
      quotedOriginalPrice: req.quotedOriginalPrice?.toString() || "",
      quotedServiceFee: req.quotedServiceFee?.toString() || "50000",
      quotedCustomerPrice: req.quotedCustomerPrice?.toString() || "",
      quoteNotes: req.quoteNotes || "Harga sudah termasuk estimasi jastip & biaya pengiriman domestik.",
      quoteExpiresAt: req.quoteExpiresAt
        ? new Date(req.quoteExpiresAt).toISOString().split("T")[0]
        : defaultExpiry.toISOString().split("T")[0],
    });
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingItem) return;
    setSavingQuote(true);

    try {
      const res = await fetch(`/api/admin/custom-requests/${quotingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QUOTED",
          quotedOriginalPrice: quoteForm.quotedOriginalPrice,
          quotedServiceFee: quoteForm.quotedServiceFee,
          quotedCustomerPrice: quoteForm.quotedCustomerPrice,
          quoteNotes: quoteForm.quoteNotes,
          quoteExpiresAt: quoteForm.quoteExpiresAt,
        }),
      });

      if (res.ok) {
        alert("Penawaran harga (Quotation) berhasil dikirim!");
        setQuotingItem(null);
        await fetchRequests();
      } else {
        alert("Gagal menyimpan penawaran harga.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingQuote(false);
    }
  };

  const handleQuickStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/custom-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      } else {
        alert("Gagal mengubah status.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.productName.toLowerCase().includes(q) ||
      r.user.name.toLowerCase().includes(q) ||
      r.trip.title.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Permintaan Khusus (Custom Requests)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau barang titipan khusus dari pelanggan di luar katalog resmi dan berikan penawaran harga (Quotation).
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang, pelanggan, trip..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {["ALL", "SUBMITTED", "UNDER_REVIEW", "QUOTED", "ACCEPTED", "DECLINED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "Semua Status" : STATUS_BADGES[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat permintaan kustom...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada permintaan ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Belum ada request kustom pada status ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((req) => {
            const badge = STATUS_BADGES[req.status] || STATUS_BADGES.SUBMITTED;
            const phone = req.user.phone || "";
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
            const waUrl = waNumber
              ? `https://wa.me/${waNumber}?text=Halo%20kak%20${encodeURIComponent(req.user.name)},%20update%20terkait%20request%20jastip%20khusus%20${encodeURIComponent(req.productName)}:`
              : null;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Trip: {req.trip.title} ({req.trip.destinationCity})
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {req.productName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Diajukan pada {new Date(req.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{req.user.name}</p>
                      <p className="text-slate-500">{req.user.email} &bull; {req.user.phone || "No HP -"}</p>
                    </div>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Chat WhatsApp"
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Jumlah:</strong> {req.quantity} pcs
                    </p>
                    {req.variantSpecs && (
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Spesifikasi/Varian:</strong>{" "}
                        {req.variantSpecs}
                      </p>
                    )}
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Deskripsi:</strong> {req.description}
                    </p>

                    {req.referenceUrl && (
                      <p className="text-slate-600 flex items-center gap-1">
                        <strong className="text-slate-800">Link Ref:</strong>
                        <a
                          href={req.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 truncate max-w-xs"
                        >
                          {req.referenceUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    )}

                    {req.referenceImage && (
                      <div>
                        <strong className="text-slate-800 block mb-1">Foto Referensi:</strong>
                        <a href={req.referenceImage} target="_blank" rel="noreferrer">
                          <img
                            src={req.referenceImage}
                            alt="Referensi"
                            className="w-24 h-24 object-cover rounded-xl border border-slate-200 hover:scale-105 transition"
                          />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Quoted Info (if already quoted) */}
                  {req.quotedCustomerPrice && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-purple-900">
                        <span>Penawaran ke Pelanggan:</span>
                        <span>Rp {req.quotedCustomerPrice.toLocaleString("id-ID")}</span>
                      </div>
                      {req.quotedOriginalPrice && (
                        <p className="text-purple-700">
                          Est. Harga Asal: {req.trip.purchaseCurrency}{" "}
                          {req.quotedOriginalPrice.toLocaleString()}
                        </p>
                      )}
                      {req.quoteNotes && (
                        <p className="text-purple-600 italic">Catatan: {req.quoteNotes}</p>
                      )}
                      {req.quoteExpiresAt && (
                        <p className="text-purple-500 text-[11px]">
                          Berlaku sampai:{" "}
                          {new Date(req.quoteExpiresAt).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openQuoteModal(req)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    {req.status === "QUOTED" ? "Edit Penawaran" : "Beri Penawaran (Quote)"}
                  </button>

                  {req.status === "SUBMITTED" && (
                    <button
                      onClick={() => handleQuickStatus(req.id, "UNDER_REVIEW")}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Tandai Diperiksa
                    </button>
                  )}

                  {req.status !== "DECLINED" && req.status !== "CONVERTED_TO_ORDER" && (
                    <button
                      onClick={() => handleQuickStatus(req.id, "DECLINED")}
                      className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                    >
                      Tolak
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quote Modal */}
      {quotingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Beri Penawaran Harga (Quotation)
            </h3>
            <p className="text-xs text-slate-500">
              Produk: <strong className="text-slate-800">{quotingItem.productName}</strong> (Trip:{" "}
              {quotingItem.trip.title})
            </p>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Estimasi Harga Asal ({quotingItem.trip.purchaseCurrency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 3500"
                    value={quoteForm.quotedOriginalPrice}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({ ...prev, quotedOriginalPrice: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fee Jastip (IDR)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={quoteForm.quotedServiceFee}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({ ...prev, quotedServiceFee: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Total Harga Penawaran ke Pelanggan (IDR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 450000"
                  value={quoteForm.quotedCustomerPrice}
                  onChange={(e) =>
                    setQuoteForm((prev) => ({ ...prev, quotedCustomerPrice: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Batas Waktu Penawaran</label>
                <input
                  type="date"
                  value={quoteForm.quoteExpiresAt}
                  onChange={(e) =>
                    setQuoteForm((prev) => ({ ...prev, quoteExpiresAt: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan untuk Pelanggan</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan toko, ketersediaan varian, perkiraan berat..."
                  value={quoteForm.quoteNotes}
                  onChange={(e) =>
                    setQuoteForm((prev) => ({ ...prev, quoteNotes: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuotingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingQuote}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {savingQuote ? "Mengirim..." : "Kirim Penawaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
