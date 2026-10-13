"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Truck,
  MessageCircle,
  ExternalLink,
  Save,
  RefreshCw,
  FileText,
} from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  trip: {
    id: string;
    title: string;
    destinationCountry: string;
    destinationCity: string;
    purchaseCurrency: string;
    departureDate: string;
    returnDate: string;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    originalUnitPrice: number;
    unitPrice: number;
    subtotal: number;
  }>;
  pricingSnapshot: {
    subtotal: number;
    serviceFee: number;
    shippingFee: number;
    taxesOrDuties: number;
    totalPayable: number;
    currency: string;
    tripCurrency: string;
    exchangeRate: number;
    exchangeRateSource: string;
    rateTimestamp: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    proofImageUrl: string | null;
    referenceNotes: string | null;
    status: string;
    rejectionReason: string | null;
    createdAt: string;
  }>;
  statusHistory: Array<{
    id: string;
    type: string;
    previousStatus: string;
    newStatus: string;
    notes: string | null;
    createdAt: string;
    actor: {
      name: string;
      role: string;
    };
  }>;
}

const FULFILLMENT_STEPS = [
  "PENDING_REVIEW",
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "PURCHASING",
  "PURCHASED",
  "IN_TRANSIT",
  "ARRIVED",
  "READY_FOR_DELIVERY",
  "COMPLETED",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFulfill, setSelectedFulfill] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found.");
      const data = await res.json();
      setOrder(data);
      setSelectedFulfill(data.fulfillmentStatus);
      setSelectedPayment(data.paymentStatus);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentStatus: selectedFulfill,
          paymentStatus: selectedPayment,
          notes: statusNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status order.");
      setStatusNotes("");
      await fetchOrder();
      alert("Status berhasil diperbarui!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">{error || "ID pesanan tidak valid."}</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  const waUrl = `https://wa.me/${waNumber}?text=Halo%20kak%20${encodeURIComponent(order.customerName)},%20update%20pesanan%20jastip%20kamu%20${order.orderNumber}%20saat%20ini%20berstatus:%20${order.fulfillmentStatus}`;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900">{order.orderNumber}</h1>
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg">
                {order.fulfillmentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dibuat pada{" "}
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Pelanggan
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            Cetak Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Items, Pricing, Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                Daftar Barang Pesanan ({order.items.length})
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Trip: {order.trip?.title}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Nama Produk & Varian</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4">Harga Asal ({order.trip?.purchaseCurrency})</th>
                    <th className="py-3 px-4">Harga Satuan (IDR)</th>
                    <th className="py-3 px-4 text-right">Subtotal (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        {item.variantName && (
                          <span className="text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                            {item.variantName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.trip?.purchaseCurrency} {item.originalUnitPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        Rp {item.unitPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Snapshot */}
          {order.pricingSnapshot && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Rincian Snapshot Pembayaran Terkunci
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Belanja Barang:</span>
                  <span className="font-semibold text-slate-800">
                    Rp {order.pricingSnapshot.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Jasa Titip / Fee Layanan:</span>
                  <span className="font-semibold text-slate-800">
                    Rp {order.pricingSnapshot.serviceFee.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimasi Ongkir Domestik:</span>
                  <span className="font-semibold text-slate-800">
                    Rp {order.pricingSnapshot.shippingFee.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Operasional / Pajak:</span>
                  <span className="font-semibold text-slate-800">
                    Rp {order.pricingSnapshot.taxesOrDuties.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-base font-extrabold text-slate-900">
                  <span>Total Tagihan Akhir:</span>
                  <span className="text-indigo-600 text-lg">
                    Rp {order.pricingSnapshot.totalPayable.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                <p>
                  <strong className="text-slate-700">Kurs Konversi:</strong> 1{" "}
                  {order.pricingSnapshot.tripCurrency} = Rp{" "}
                  {order.pricingSnapshot.exchangeRate.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="text-slate-700">Sumber Kurs:</strong>{" "}
                  {order.pricingSnapshot.exchangeRateSource}
                </p>
                <p>
                  <strong className="text-slate-700">Waktu Kunci Kurs:</strong>{" "}
                  {new Date(order.pricingSnapshot.rateTimestamp).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}

          {/* Payments Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Bukti Transfer & Pembayaran ({order.payments.length})
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Status: {order.paymentStatus}
              </span>
            </div>

            {order.payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 italic text-center">
                Belum ada bukti pembayaran diunggah oleh pelanggan.
              </p>
            ) : (
              <div className="space-y-4">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-900 text-sm">
                        Rp {p.amount.toLocaleString("id-ID")} ({p.method})
                      </p>
                      <p className="text-slate-500">
                        Diunggah pada {new Date(p.createdAt).toLocaleString("id-ID")}
                      </p>
                      {p.referenceNotes && (
                        <p className="text-slate-600 italic">Catatan: {p.referenceNotes}</p>
                      )}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    {p.proofImageUrl && (
                      <div className="flex items-center gap-3">
                        <a
                          href={p.proofImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <img
                            src={p.proofImageUrl}
                            alt="Bukti Transfer"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200 hover:scale-105 transition"
                          />
                        </a>
                        <Link
                          href="/admin/payments"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                        >
                          Buka Verifikasi
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info, Status Management, Timeline */}
        <div className="space-y-6">
          {/* Status Update Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Perbarui Status Pesanan
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status Alur Pemenuhan</label>
                <select
                  value={selectedFulfill}
                  onChange={(e) => setSelectedFulfill(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PENDING_REVIEW">Menunggu Review</option>
                  <option value="AWAITING_PAYMENT">Menunggu Bayar</option>
                  <option value="CONFIRMED">Dikonfirmasi (Lunas)</option>
                  <option value="PURCHASING">Sedang Dibelikan di Toko</option>
                  <option value="PURCHASED">Berhasil Dibeli (Ready Pack)</option>
                  <option value="IN_TRANSIT">Pengiriman Udara ke Indonesia</option>
                  <option value="ARRIVED">Tiba di Indonesia / Sortasi</option>
                  <option value="READY_FOR_DELIVERY">Siap Kirim ke Alamat</option>
                  <option value="COMPLETED">Selesai (Diterima)</option>
                  <option value="CANCELLED">Dibatalkan</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status Pembayaran</label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AWAITING_PAYMENT">AWAITING_PAYMENT (Belum Bayar)</option>
                  <option value="SUBMITTED_FOR_REVIEW">SUBMITTED_FOR_REVIEW (Review Bukti)</option>
                  <option value="PAID_AND_VERIFIED">PAID_AND_VERIFIED (Lunas & Terverifikasi)</option>
                  <option value="REJECTED">REJECTED (Bukti Ditolak)</option>
                  <option value="NOT_REQUIRED">NOT_REQUIRED (Bebas Bayar)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Perubahan (Internal/Log)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Barang sudah dibeli di Don Quijote Shinjuku..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Menyimpan..." : "Simpan Status Baru"}
              </button>
            </form>
          </div>

          {/* Customer & Delivery Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Info Penerima & Pengiriman
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Nama Pelanggan:</p>
                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                <p className="text-slate-500">{order.user.email}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Nomor WhatsApp:</p>
                <p className="font-bold text-slate-900">{order.customerPhone}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Alamat Pengiriman:</p>
                <p className="font-medium text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {order.deliveryAddress}
                </p>
              </div>

              {order.deliveryNotes && (
                <div>
                  <p className="text-slate-400 font-medium">Catatan Khusus:</p>
                  <p className="text-slate-600 italic mt-0.5">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Riwayat Perubahan Status ({order.statusHistory.length})
            </h2>

            {order.statusHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada riwayat perubahan.</p>
            ) : (
              <div className="space-y-3">
                {order.statusHistory.map((h) => (
                  <div key={h.id} className="relative pl-4 border-l-2 border-indigo-200 space-y-1">
                    <div className="text-xs font-bold text-slate-800">
                      {h.previousStatus} &rarr;{" "}
                      <span className="text-indigo-600">{h.newStatus}</span>
                    </div>
                    {h.notes && (
                      <p className="text-[11px] text-slate-600 italic">{h.notes}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Oleh {h.actor.name} ({h.actor.role}) &bull;{" "}
                      {new Date(h.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
