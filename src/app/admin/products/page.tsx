"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  Filter,
  DollarSign,
  Tag,
  Trash2,
  ExternalLink,
  RefreshCw,
  Plane,
  Eye,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  sourceStore: string | null;
  originalPrice: number;
  originalCurrency: string;
  quantityLimit: number | null;
  availabilityStatus: string;
  images: string;
  trip: {
    id: string;
    title: string;
    destinationCountry: string;
    purchaseCurrency: string;
  };
  variants?: Array<{
    id: string;
    name: string;
    priceAdjustment: number;
  }>;
}

const AVAILABILITY_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  AVAILABLE: { label: "Tersedia", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  LIMITED: { label: "Stok Terbatas", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  OUT_OF_STOCK: { label: "Habis (Sold Out)", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  UNAVAILABLE: { label: "Tidak Tersedia", bg: "bg-slate-100 border-slate-200", text: "text-slate-700" },
};

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialTripId = searchParams.get("tripId") || "ALL";

  const [products, setProducts] = useState<Product[]>([]);
  const [trips, setTrips] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(initialTripId);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProductsAndTrips = async () => {
    setLoading(true);
    try {
      const [prodRes, tripRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/trips"),
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        setTrips(tripData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndTrips();
  }, []);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, availabilityStatus: newStatus } : p))
        );
      } else {
        alert("Gagal memperbarui status ketersediaan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Hapus produk ini dari katalog?")) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        alert("Gagal menghapus produk.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.sourceStore && p.sourceStore.toLowerCase().includes(search.toLowerCase()));
    const matchesTrip = selectedTrip === "ALL" || p.trip.id === selectedTrip;
    const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesTrip && matchesCat;
  });

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Katalog Produk Jastip
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola produk yang tersedia untuk dipre-order pada masing-masing shopping trip.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk, merk, store..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Trip Selector */}
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Trip</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat katalog produk...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada produk ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Coba sesuaikan filter atau tambahkan produk baru.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Produk & Brand</th>
                  <th className="py-3.5 px-4">Trip Terkait</th>
                  <th className="py-3.5 px-4">Kategori & Toko</th>
                  <th className="py-3.5 px-4">Harga Asal (Foreign)</th>
                  <th className="py-3.5 px-4">Varian</th>
                  <th className="py-3.5 px-4">Ketersediaan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filtered.map((product) => {
                  let imgUrl = "/placeholder.png";
                  try {
                    const parsed = JSON.parse(product.images);
                    if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                  } catch (e) {
                    if (product.images.startsWith("http")) imgUrl = product.images;
                  }

                  const badge = AVAILABILITY_BADGES[product.availabilityStatus] || AVAILABILITY_BADGES.AVAILABLE;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                            onError={(e) => {
                              (e.target as any).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120";
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900">{product.name}</p>
                            {product.brand && (
                              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 line-clamp-1">{product.trip?.title}</p>
                          <p className="text-slate-400 mt-0.5">{product.trip?.destinationCountry}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs space-y-0.5">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium inline-block">
                            {product.category}
                          </span>
                          {product.sourceStore && (
                            <p className="text-[11px] text-slate-500 font-medium">{product.sourceStore}</p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-slate-900">
                          {product.originalCurrency} {product.originalPrice.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg font-medium">
                          {product.variants?.length || 0} varian
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          disabled={updatingId === product.id}
                          value={product.availabilityStatus}
                          onChange={(e) => handleStatusChange(product.id, e.target.value)}
                          className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${badge.bg} ${badge.text}`}
                        >
                          <option value="AVAILABLE">Tersedia</option>
                          <option value="LIMITED">Stok Terbatas</option>
                          <option value="OUT_OF_STOCK">Habis (Sold Out)</option>
                          <option value="UNAVAILABLE">Tidak Tersedia</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            title="Lihat produk di storefront"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            title="Hapus produk"
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

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <p className="text-sm font-medium text-slate-500">Memuat katalog admin...</p>
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
