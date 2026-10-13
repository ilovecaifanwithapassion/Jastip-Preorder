"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Upload,
  MessageCircle,
  MapPin,
  Loader2,
  RefreshCw,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";

const STEPS = [
  { key: "PENDING_REVIEW", label: "Menunggu Review" },
  { key: "AWAITING_PAYMENT", label: "Menunggu Pembayaran" },
  { key: "CONFIRMED", label: "Terkonfirmasi" },
  { key: "PURCHASING", label: "Sedang Dibeli" },
  { key: "PURCHASED", label: "Barang Dibeli" },
  { key: "IN_TRANSIT", label: "Dalam Perjalanan" },
  { key: "ARRIVED", label: "Tiba di Indonesia" },
  { key: "READY_FOR_DELIVERY", label: "Siap Dikirim" },
  { key: "COMPLETED", label: "Selesai" },
];

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "MANUAL_BANK_TRANSFER", referenceNotes: "" });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?redirect=/orders/${orderId}`);
    }
  }, [authStatus, router, orderId]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => setOrder(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authStatus, orderId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim bukti pembayaran.");
      setPaymentSuccess(true);
      // Refresh order
      const refreshed = await fetch(`/api/orders/${orderId}`).then((r) => r.json());
      setOrder(refreshed);
    } catch (e: any) {
      setPaymentError(e.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!order || order.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700">Pesanan Tidak Ditemukan</h2>
          <Link href="/orders" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Riwayat Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = STEPS.findIndex((s) => s.key === order.fulfillmentStatus);
  const isCancelled = order.fulfillmentStatus === "CANCELLED" || order.fulfillmentStatus === "REFUNDED";
  const canSubmitPayment = order.paymentStatus === "AWAITING_PAYMENT" && order.fulfillmentStatus !== "CANCELLED";
  const snapshot = order.pricingSnapshot;

  const whatsappUrl = getWhatsAppSupportUrl({
    type: "ORDER_STATUS",
    orderNumber: order.orderNumber,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 font-mono">{order.orderNumber}</h1>
          <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* Trip Info */}
      {order.trip && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-indigo-900 text-sm">{order.trip.title}</p>
            <p className="text-xs text-indigo-500">{order.trip.destinationCity}, {order.trip.destinationCountry}</p>
          </div>
          <Link href={`/trips/${order.trip.id}`} className="ml-auto text-xs text-indigo-600 font-bold hover:underline flex-shrink-0">
            Lihat Trip →
          </Link>
        </div>
      )}

      {/* Tracking Steps */}
      {!isCancelled && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            Tracking Pesanan
          </h2>
          <div className="space-y-3">
            {STEPS.filter((s) => s.key !== "AWAITING_PAYMENT").map((step, idx) => {
              const filteredIdx = STEPS.filter((s) => s.key !== "AWAITING_PAYMENT").indexOf(step);
              const currentFilteredIdx = STEPS.filter((s) => s.key !== "AWAITING_PAYMENT").findIndex((s) => s.key === order.fulfillmentStatus);
              const isDone = filteredIdx <= currentFilteredIdx;
              const isCurrent = step.key === order.fulfillmentStatus;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${isDone ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${isCurrent ? "font-bold text-indigo-700" : isDone ? "text-slate-600" : "text-slate-300"}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-700">{order.fulfillmentStatus === "REFUNDED" ? "Pesanan Direfund" : "Pesanan Dibatalkan"}</p>
            <p className="text-sm text-red-500">Hubungi admin untuk informasi lebih lanjut.</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-indigo-600" />
          Item Pesanan
        </h2>
        {order.items?.map((item: any) => {
          const images = (() => { try { return JSON.parse(item.product?.images || "[]") as string[]; } catch { return []; } })();
          return (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                {images[0] ? (
                  <img src={images[0]} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm line-clamp-1">{item.productName}</p>
                {item.variantName && <p className="text-xs text-slate-400">{item.variantName}</p>}
                <p className="text-xs text-slate-500 mt-0.5">×{item.quantity} · Rp {item.unitPrice.toLocaleString("id-ID")}/item</p>
              </div>
              <p className="font-bold text-slate-900 flex-shrink-0">Rp {item.subtotal.toLocaleString("id-ID")}</p>
            </div>
          );
        })}
      </div>

      {/* Pricing Snapshot */}
      {snapshot && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Rincian Pembayaran
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal Produk</span>
              <span className="font-medium text-slate-700">Rp {snapshot.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jasa Titip</span>
              <span className="font-medium text-slate-700">Rp {snapshot.serviceFee.toLocaleString("id-ID")}</span>
            </div>
            {snapshot.shippingFee > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Ongkos Kirim</span>
                <span className="font-medium text-slate-700">Rp {snapshot.shippingFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            <hr className="border-slate-200" />
            <div className="flex justify-between">
              <span className="font-bold text-slate-900">Total Bayar</span>
              <span className="font-extrabold text-indigo-700 text-lg">Rp {snapshot.totalPayable.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">Rate: 1 {snapshot.tripCurrency} = Rp {snapshot.exchangeRate.toLocaleString("id-ID")} ({snapshot.exchangeRateSource})</p>
        </div>
      )}

      {/* Payment Submission */}
      {canSubmitPayment && (
        <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 space-y-4">
          <h2 className="font-bold text-orange-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-orange-600" />
            Submit Bukti Pembayaran
          </h2>
          {paymentSuccess ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-700">Bukti pembayaran berhasil dikirim! Admin akan memverifikasi segera.</p>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {paymentError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {paymentError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Jumlah Transfer (IDR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
                  placeholder={snapshot ? snapshot.totalPayable.toString() : "Masukkan jumlah transfer"}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Referensi</label>
                <input
                  type="text"
                  value={paymentForm.referenceNotes}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, referenceNotes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
                  placeholder="No. referensi transfer, tanggal, dll."
                />
              </div>
              <p className="text-xs text-orange-600 bg-orange-100 p-3 rounded-xl">
                📸 Kirim screenshot bukti transfer ke admin via WhatsApp untuk mempercepat verifikasi.
              </p>
              <button
                type="submit"
                disabled={submittingPayment}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-60"
              >
                {submittingPayment ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : <><Upload className="w-4 h-4" />Kirim Bukti Bayar</>}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Riwayat Status
          </h2>
          <div className="space-y-2">
            {order.statusHistory.map((h: any) => (
              <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 text-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">{h.previousStatus} → {h.newStatus}</p>
                  {h.notes && <p className="text-slate-400 text-xs mt-0.5">{h.notes}</p>}
                  <p className="text-slate-300 text-xs mt-0.5">oleh {h.actor?.name} · {new Date(h.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
      >
        <MessageCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-emerald-800 text-sm">Tanya Status Pesanan</p>
          <p className="text-xs text-emerald-600">Chat langsung dengan admin via WhatsApp</p>
        </div>
      </a>
    </div>
  );
}
