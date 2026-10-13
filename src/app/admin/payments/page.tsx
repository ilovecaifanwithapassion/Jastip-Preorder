"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Clock,
  Check,
  X,
} from "lucide-react";

interface PaymentItem {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  proofImageUrl: string | null;
  referenceNotes: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    user: {
      name: string;
      email: string;
    };
    trip: {
      title: string;
    };
    pricingSnapshot: {
      totalPayable: number;
    } | null;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SUBMITTED"); // SUBMITTED, VERIFIED, REJECTED
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const handleVerify = async (paymentId: string) => {
    if (!confirm("Konfirmasi verifikasi pembayaran ini sebagai LUNAS?")) return;
    setProcessingId(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY" }),
      });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
        alert("Pembayaran berhasil diverifikasi!");
      } else {
        alert("Gagal memverifikasi pembayaran.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    setProcessingId(rejectingId);
    try {
      const res = await fetch(`/api/admin/payments/${rejectingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason: rejectReason || "Bukti transfer tidak dapat diverifikasi.",
        }),
      });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== rejectingId));
        setRejectingId(null);
        setRejectReason("");
        alert("Pembayaran berhasil ditolak.");
      } else {
        alert("Gagal menolak pembayaran.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Verifikasi Bukti Pembayaran
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau bukti transfer manual/QRIS dari pelanggan, verifikasi kelunasan, atau tolak dengan alasan jelas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("SUBMITTED")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "SUBMITTED"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Menunggu Verifikasi
        </button>
        <button
          onClick={() => setActiveTab("VERIFIED")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "VERIFIED"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Terverifikasi (Lunas)
        </button>
        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "REJECTED"
              ? "border-red-600 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <XCircle className="w-4 h-4" />
          Ditolak
        </button>
      </div>

      {/* Payment Cards / Queue */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat antrean pembayaran...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada bukti pembayaran</h3>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "SUBMITTED"
              ? "Semua bukti transfer telah diverifikasi!"
              : "Belum ada riwayat pembayaran di status ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((p) => {
            const cleanPhone = p.order.customerPhone.replace(/[^0-9]/g, "");
            const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
            const waUrl = `https://wa.me/${waNumber}?text=Halo%20kak%20${encodeURIComponent(p.order.customerName)},%20update%20terkait%20bukti%20pembayaran%20pesanan%20${p.order.orderNumber}:`;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/admin/orders/${p.order.id}`}
                        className="text-xs font-black text-indigo-600 hover:underline"
                      >
                        {p.order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Trip: {p.order.trip?.title}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800">
                      {p.method}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Customer Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{p.order.customerName}</p>
                        <p className="text-slate-500">{p.order.customerPhone}</p>
                      </div>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Chat WhatsApp"
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Amount comparison */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nominal Tagihan:</span>
                        <span className="font-bold text-slate-800">
                          Rp {(p.order.pricingSnapshot?.totalPayable || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nominal Dibayar:</span>
                        <span className="font-black text-indigo-600">
                          Rp {p.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {p.referenceNotes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                          Catatan: {p.referenceNotes}
                        </p>
                      )}
                      {p.rejectionReason && (
                        <p className="text-[11px] text-red-600 font-semibold pt-1 border-t border-slate-200">
                          Alasan Ditolak: {p.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Proof Image */}
                    {p.proofImageUrl ? (
                      <div>
                        <p className="text-[11px] font-bold text-slate-600 mb-1.5">Bukti Transfer:</p>
                        <div
                          onClick={() => setPreviewImage(p.proofImageUrl)}
                          className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-100"
                        >
                          <img
                            src={p.proofImageUrl}
                            alt="Bukti Transfer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye className="w-4 h-4" /> Perbesar Gambar
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl text-amber-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Pelanggan tidak melampirkan screenshot bukti transfer.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {activeTab === "SUBMITTED" && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(p.id)}
                      disabled={processingId === p.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Verifikasi Lunas
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(p.id);
                        setRejectReason("");
                      }}
                      disabled={processingId === p.id}
                      className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Pratinjau Bukti Pembayaran</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] flex items-center justify-center bg-slate-950">
              <img
                src={previewImage}
                alt="Bukti Transfer Full"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Tolak Bukti Pembayaran
            </h3>
            <p className="text-xs text-slate-500">
              Berikan alasan penolakan agar pelanggan dapat melakukan transfer ulang atau memperbaiki bukti transfer.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Alasan Penolakan *</label>
                <select
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Pilih alasan umum...</option>
                  <option value="Nominal transfer tidak sesuai dengan total tagihan">
                    Nominal tidak sesuai dengan total tagihan
                  </option>
                  <option value="Gambar bukti transfer buram / tidak terbaca">
                    Gambar bukti transfer buram / tidak terbaca
                  </option>
                  <option value="Transfer belum masuk ke rekening mutasi">
                    Transfer belum masuk ke rekening mutasi
                  </option>
                  <option value="Salah rekening tujuan transfer">
                    Salah rekening tujuan transfer
                  </option>
                </select>
                <textarea
                  rows={3}
                  required
                  placeholder="Atau tuliskan alasan spesifik di sini..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingId}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {processingId === rejectingId ? "Memproses..." : "Tolak Pembayaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
