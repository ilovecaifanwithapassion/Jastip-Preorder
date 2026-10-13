"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plane,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface Trip {
  id: string;
  title: string;
  destinationCountry: string;
  destinationCity: string;
  originCity: string;
  departureDate: string;
  returnDate: string;
  orderDeadline: string;
  status: string;
  purchaseCurrency: string;
  exchangeRateMode: string;
  manualExchangeRate: number | null;
  serviceFeePercent: number;
  coverImage: string | null;
  _count?: {
    products: number;
    orders: number;
  };
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  OPEN: { label: "Buka PO", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  PUBLISHED: { label: "Published", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  DRAFT: { label: "Draft", bg: "bg-slate-100 border-slate-200", text: "text-slate-700" },
  CLOSED: { label: "Tutup PO", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  IN_PROGRESS: { label: "Berjalan", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
  COMPLETED: { label: "Selesai", bg: "bg-teal-50 border-teal-200", text: "text-teal-700" },
  CANCELLED: { label: "Dibatalkan", bg: "bg-red-50 border-red-200", text: "text-red-700" },
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    setUpdatingId(tripId);
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, status: newStatus } : t))
        );
      } else {
        alert("Gagal memperbarui status trip.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus trip ini? Semua produk dan data terkait akan ikut terhapus.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, { method: "DELETE" });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
      } else {
        alert("Gagal menghapus trip.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destinationCountry.toLowerCase().includes(search.toLowerCase()) ||
      t.destinationCity.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Plane className="w-6 h-6 text-indigo-600" />
            Kelola Shopping Trips
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur jadwal trip luar negeri, deadline PO, mata uang asal, dan status ketersediaan.
          </p>
        </div>
        <Link
          href="/admin/trips/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Trip Baru
        </Link>
      </div>

      {/* Controls & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari trip, negara, atau kota..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {["ALL", "OPEN", "PUBLISHED", "DRAFT", "CLOSED", "COMPLETED"].map((st) => (
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

      {/* Trip List Table / Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat daftar trip...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada trip ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Trip & Destinasi</th>
                  <th className="py-3.5 px-4">Jadwal & Deadline</th>
                  <th className="py-3.5 px-4">Mata Uang & Kurs</th>
                  <th className="py-3.5 px-4">Katalog & Pesanan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredTrips.map((trip) => {
                  const badge = STATUS_BADGES[trip.status] || STATUS_BADGES.DRAFT;
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {trip.coverImage ? (
                            <img
                              src={trip.coverImage}
                              alt={trip.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                              <Plane className="w-5 h-5 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 hover:text-indigo-600 transition">
                              {trip.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {trip.destinationCity}, {trip.destinationCountry}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs space-y-1">
                          <p className="text-slate-600 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(trip.departureDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            -{" "}
                            {new Date(trip.returnDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold inline-block">
                            Deadline PO:{" "}
                            {new Date(trip.orderDeadline).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                            {trip.purchaseCurrency}
                          </span>
                          <p className="text-slate-500 text-[11px]">
                            Mode Kurs:{" "}
                            <span className="font-semibold text-slate-700">
                              {trip.exchangeRateMode === "MANUAL_OVERRIDE"
                                ? `Manual (${trip.manualExchangeRate || "-"})`
                                : "Auto Live ECB"}
                            </span>
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Fee: {trip.serviceFeePercent}%
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs space-y-1">
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Package className="w-3.5 h-3.5 text-indigo-500" />
                            {trip._count?.products || 0} Produk
                          </span>
                          <br />
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                            {trip._count?.orders || 0} Pesanan
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          disabled={updatingId === trip.id}
                          value={trip.status}
                          onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                          className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${badge.bg} ${badge.text}`}
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                          <option value="OPEN">Buka PO (Open)</option>
                          <option value="CLOSED">Tutup PO (Closed)</option>
                          <option value="IN_PROGRESS">Berjalan (In Progress)</option>
                          <option value="COMPLETED">Selesai (Completed)</option>
                          <option value="CANCELLED">Dibatalkan</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/trips/${trip.id}`}
                            target="_blank"
                            title="Lihat halaman publik"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products?tripId=${trip.id}`}
                            title="Kelola produk trip"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Package className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            title="Hapus trip"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
