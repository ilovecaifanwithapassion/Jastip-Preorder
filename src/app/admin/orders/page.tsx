"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Calendar,
  CreditCard,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  trip: {
    id: string;
    title: string;
    destinationCountry: string;
  };
  pricingSnapshot: {
    totalPayable: number;
    currency: string;
  } | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
  }>;
}

const FULFILLMENT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING_REVIEW: { label: "Menunggu Review", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  AWAITING_PAYMENT: { label: "Menunggu Bayar", bg: "bg-orange-50 border-orange-200", text: "text-orange-700" },
  CONFIRMED: { label: "Dikonfirmasi", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  PURCHASING: { label: "Sedang Dibelikan", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  PURCHASED: { label: "Berhasil Dibeli", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
  IN_TRANSIT: { label: "Pengiriman ke Indo", bg: "bg-sky-50 border-sky-200", text: "text-sky-700" },
  ARRIVED: { label: "Tiba di Indonesia", bg: "bg-teal-50 border-teal-200", text: "text-teal-700" },
  READY_FOR_DELIVERY: { label: "Siap Kirim", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  COMPLETED: { label: "Selesai", bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800" },
  CANCELLED: { label: "Dibatalkan", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  REFUNDED: { label: "Refund", bg: "bg-slate-100 border-slate-200", text: "text-slate-700" },
};

const PAYMENT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  AWAITING_PAYMENT: { label: "Belum Bayar", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
  SUBMITTED_FOR_REVIEW: { label: "Verifikasi Bukti", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  PAID_AND_VERIFIED: { label: "Lunas & Terverifikasi", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  REJECTED: { label: "Bukti Ditolak", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  NOT_REQUIRED: { label: "Bebas Bayar", bg: "bg-slate-100 border-slate-200", text: "text-slate-700" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, fulfillmentStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentStatus,
          notes: `Status diubah oleh admin via daftar pesanan`,
        }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus } : o))
        );
      } else {
        alert("Gagal memperbarui status order.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const query = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerPhone.toLowerCase().includes(query);
    const matchesFulfill = fulfillmentFilter === "ALL" || o.fulfillmentStatus === fulfillmentFilter;
    const matchesPay = paymentFilter === "ALL" || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesFulfill && matchesPay;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Kelola Pesanan Pre-Order
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan perbarui alur pemenuhan barang dari pembelian luar negeri hingga tiba di pelanggan.
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
            placeholder="Cari No. Order, Nama, HP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Fulfillment Status Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Alur Pemenuhan</option>
            <option value="PENDING_REVIEW">Menunggu Review</option>
            <option value="AWAITING_PAYMENT">Menunggu Bayar</option>
            <option value="CONFIRMED">Dikonfirmasi</option>
            <option value="PURCHASING">Sedang Dibelikan</option>
            <option value="PURCHASED">Berhasil Dibeli</option>
            <option value="IN_TRANSIT">Pengiriman ke Indo</option>
            <option value="ARRIVED">Tiba di Indonesia</option>
            <option value="READY_FOR_DELIVERY">Siap Kirim</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Status Pembayaran</option>
            <option value="SUBMITTED_FOR_REVIEW">Perlu Verifikasi Bukti</option>
            <option value="PAID_AND_VERIFIED">Lunas & Terverifikasi</option>
            <option value="AWAITING_PAYMENT">Belum Bayar</option>
            <option value="REJECTED">Bukti Ditolak</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat data pesanan...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada pesanan ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Belum ada pesanan dengan kriteria filter tersebut.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Order & Tanggal</th>
                  <th className="py-3.5 px-4">Pelanggan & Kontak</th>
                  <th className="py-3.5 px-4">Shopping Trip</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Status Bayar</th>
                  <th className="py-3.5 px-4">Status Pemenuhan</th>
                  <th className="py-3.5 px-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filtered.map((order) => {
                  const fulfillBadge = FULFILLMENT_LABELS[order.fulfillmentStatus] || FULFILLMENT_LABELS.PENDING_REVIEW;
                  const payBadge = PAYMENT_LABELS[order.paymentStatus] || PAYMENT_LABELS.AWAITING_PAYMENT;
                  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
                  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                  const waUrl = `https://wa.me/${waNumber}?text=Halo%20kak%20${encodeURIComponent(order.customerName)},%20update%20terkait%20pesanan%20jastip%20${order.orderNumber}:`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-500">{order.customerPhone}</span>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat WhatsApp"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 line-clamp-1">{order.trip?.title}</p>
                          <p className="text-slate-400 mt-0.5">{order.trip?.destinationCountry}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          Rp {(order.pricingSnapshot?.totalPayable || 0).toLocaleString("id-ID")}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.items?.length || 0} barang
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${payBadge.bg} ${payBadge.text}`}
                        >
                          {payBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          disabled={updatingId === order.id}
                          value={order.fulfillmentStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${fulfillBadge.bg} ${fulfillBadge.text}`}
                        >
                          <option value="PENDING_REVIEW">Menunggu Review</option>
                          <option value="AWAITING_PAYMENT">Menunggu Bayar</option>
                          <option value="CONFIRMED">Dikonfirmasi</option>
                          <option value="PURCHASING">Sedang Dibelikan</option>
                          <option value="PURCHASED">Berhasil Dibeli</option>
                          <option value="IN_TRANSIT">Pengiriman ke Indo</option>
                          <option value="ARRIVED">Tiba di Indonesia</option>
                          <option value="READY_FOR_DELIVERY">Siap Kirim</option>
                          <option value="COMPLETED">Selesai</option>
                          <option value="CANCELLED">Dibatalkan</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
