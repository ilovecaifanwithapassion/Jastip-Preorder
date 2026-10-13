"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  Tag,
  Save,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

interface VariantInput {
  name: string;
  priceAdjustment: string;
  stockLimit: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Array<{ id: string; title: string; purchaseCurrency: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTrips, setFetchingTrips] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tripId: "",
    name: "",
    category: "Skincare & Beauty",
    brand: "",
    sourceStore: "",
    externalUrl: "",
    originalPrice: "",
    quantityLimit: "",
    availabilityStatus: "AVAILABLE",
    imageUrl: "",
    description: "",
  });

  const [variants, setVariants] = useState<VariantInput[]>([]);

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/admin/trips");
        if (res.ok) {
          const data = await res.json();
          setTrips(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, tripId: data[0].id }));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingTrips(false);
      }
    }
    loadTrips();
  }, []);

  const selectedTrip = trips.find((t) => t.id === formData.tripId);
  const currencyCode = selectedTrip ? selectedTrip.purchaseCurrency : "Foreign Currency";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { name: "", priceAdjustment: "0", stockLimit: "" }]);
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.tripId) {
        throw new Error("Silakan pilih trip terlebih dahulu.");
      }

      const imagesArray = formData.imageUrl.trim()
        ? [formData.imageUrl.trim()]
        : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"];

      const payload = {
        tripId: formData.tripId,
        name: formData.name,
        category: formData.category,
        brand: formData.brand || null,
        sourceStore: formData.sourceStore || null,
        externalUrl: formData.externalUrl || null,
        originalPrice: parseFloat(formData.originalPrice),
        originalCurrency: currencyCode,
        quantityLimit: formData.quantityLimit ? parseInt(formData.quantityLimit) : null,
        availabilityStatus: formData.availabilityStatus,
        images: JSON.stringify(imagesArray),
        description: formData.description,
        variants: variants
          .filter((v) => v.name.trim().length > 0)
          .map((v) => ({
            name: v.name.trim(),
            priceAdjustment: parseFloat(v.priceAdjustment) || 0,
            stockLimit: v.stockLimit ? parseInt(v.stockLimit) : null,
          })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat produk baru.");
      }

      router.push(`/admin/products?tripId=${formData.tripId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tambah Produk Jastip Baru</h1>
          <p className="text-sm text-slate-500">
            Daftarkan produk pre-order pada trip aktif dengan detail harga mata uang asal.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Pemilihan Trip */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Package className="w-4 h-4 text-indigo-600" />
            Trip Shopping Terkait
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Pilih Trip *</label>
            {fetchingTrips ? (
              <p className="text-sm text-slate-500">Memuat daftar trip...</p>
            ) : trips.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-sm">
                Belum ada trip dibuat. Silakan{" "}
                <Link href="/admin/trips/new" className="font-bold underline">
                  buat trip terlebih dahulu
                </Link>
                .
              </div>
            ) : (
              <select
                name="tripId"
                required
                value={formData.tripId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.purchaseCurrency})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Mata uang asal produk akan otomatis disesuaikan dengan mata uang trip ({currencyCode}).
            </p>
          </div>
        </div>

        {/* Section 2: Info Produk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Tag className="w-4 h-4 text-indigo-600" />
            Detail Informasi Produk
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nama Produk *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Rohto Melano CC Vitamin C Essence 20ml"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kategori *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="Skincare & Beauty">Skincare & Beauty</option>
                <option value="Snacks & Food">Snacks & Food</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Collectibles & Toys">Collectibles & Toys</option>
                <option value="Medicines & Wellness">Medicines & Wellness</option>
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Home & Living">Home & Living</option>
                <option value="General">General / Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Brand / Merek</label>
              <input
                type="text"
                name="brand"
                placeholder="Contoh: Rohto, Uniqlo, Pop Mart"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Toko Pembelian (Source Store)</label>
              <input
                type="text"
                name="sourceStore"
                placeholder="Contoh: Don Quijote, Matsumoto Kiyoshi"
                value={formData.sourceStore}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Harga Retail Asli ({currencyCode}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  name="originalPrice"
                  required
                  placeholder="Contoh: 1200"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currencyCode}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Batas Kuota / Stok (Opsional)</label>
              <input
                type="number"
                name="quantityLimit"
                placeholder="Biarkan kosong jika tidak dibatasi"
                value={formData.quantityLimit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL Gambar Produk</label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Deskripsi & Spesifikasi Produk</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Jelaskan detail ukuran, varian rasa/warna, atau cara pemakaian..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Section 3: Varian Produk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Varian Produk (Opsional)</h2>
              <p className="text-xs text-slate-500">
                Tambahkan pilihan seperti ukuran (S, M, L), aroma, atau shade warna.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Varian
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-slate-400 py-2 italic text-center">
              Belum ada varian ditambahkan. Produk akan dijual sebagai varian tunggal/standar.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Nama Varian (misal: 50ml, Shade #01, Matcha)"
                      value={v.name}
                      onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="w-36">
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        placeholder="Selisih (+/-)"
                        value={v.priceAdjustment}
                        onChange={(e) => handleVariantChange(idx, "priceAdjustment", e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        {currencyCode}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || trips.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
