"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Save,
  Globe,
} from "lucide-react";

export default function AdminNewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    destinationCountry: "Jepang",
    destinationCity: "Tokyo",
    originCity: "Jakarta",
    departureDate: "",
    returnDate: "",
    orderOpenDate: new Date().toISOString().split("T")[0],
    orderDeadline: "",
    estimatedDeliveryDate: "",
    status: "OPEN",
    purchaseCurrency: "JPY",
    exchangeRateMode: "AUTO_LIVE",
    manualExchangeRate: "",
    serviceFeePercent: "10",
    flatServiceFee: "0",
    coverImage: "",
    description: "",
    termsAndNotes: "1. Barang dibeli langsung di official store / retail terpercaya.\n2. Jika stok kosong, pengembalian dana 100% diproses dalam 1x24 jam.\n3. Barang berharga / pecah belah dikemas dengan bubble wrap tebal.",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat trip baru.");
      }

      router.push("/admin/trips");
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
          href="/admin/trips"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Buat Shopping Trip Baru</h1>
          <p className="text-sm text-slate-500">
            Jadwalkan rute shopping trip baru dan tentukan aturan kurs serta fee.
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
        {/* Section 1: Informasi Dasar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe className="w-4 h-4 text-indigo-600" />
            Destinasi & Judul Trip
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Judul Shopping Trip *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="Contoh: Tokyo Spring Cherry Blossom Shopping Spree"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Negara Tujuan *</label>
              <input
                type="text"
                name="destinationCountry"
                required
                placeholder="Contoh: Jepang"
                value={formData.destinationCountry}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kota Tujuan *</label>
              <input
                type="text"
                name="destinationCity"
                required
                placeholder="Contoh: Tokyo"
                value={formData.destinationCity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kota Asal / Pengiriman</label>
              <input
                type="text"
                name="originCity"
                placeholder="Jakarta"
                value={formData.originCity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL Gambar Sampul (Cover Image)</label>
            <input
              type="url"
              name="coverImage"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Jelaskan fokus belanja pada trip kali ini (misal: skincare Ginza, figur Akihabara, snacks Don Quijote)..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Section 2: Jadwal & Deadline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Jadwal Penerbangan & Batas Order
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tanggal Berangkat *</label>
              <input
                type="date"
                name="departureDate"
                required
                value={formData.departureDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tanggal Kembali *</label>
              <input
                type="date"
                name="returnDate"
                required
                value={formData.returnDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Batas Akhir Pemesanan (Deadline PO) *</label>
              <input
                type="date"
                name="orderDeadline"
                required
                value={formData.orderDeadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Estimasi Mulai Pengiriman ke Pelanggan</label>
              <input
                type="date"
                name="estimatedDeliveryDate"
                value={formData.estimatedDeliveryDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mata Uang & Konfigurasi Kurs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            Mata Uang Belanja & Kebijakan Kurs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mata Uang Lokal Belanja *</label>
              <select
                name="purchaseCurrency"
                value={formData.purchaseCurrency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-bold text-indigo-700"
              >
                <option value="JPY">JPY - Japanese Yen (¥)</option>
                <option value="SGD">SGD - Singapore Dollar (S$)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="KRW">KRW - Korean Won (₩)</option>
                <option value="THB">THB - Thai Baht (฿)</option>
                <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="AUD">AUD - Australian Dollar (A$)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Metode Kurs Konversi *</label>
              <select
                name="exchangeRateMode"
                value={formData.exchangeRateMode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="AUTO_LIVE">Auto Live Rate (European Central Bank)</option>
                <option value="MANUAL_OVERRIDE">Manual Override (Kunci Kurs Tetap)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Kurs Manual (ke IDR) {formData.exchangeRateMode === "MANUAL_OVERRIDE" && "*"}
              </label>
              <input
                type="number"
                step="any"
                name="manualExchangeRate"
                disabled={formData.exchangeRateMode !== "MANUAL_OVERRIDE"}
                placeholder={formData.exchangeRateMode === "MANUAL_OVERRIDE" ? "Contoh: 110.5" : "Otomatis dari API"}
                value={formData.manualExchangeRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jasa Titip / Fee Layanan (%) *</label>
              <input
                type="number"
                step="0.1"
                name="serviceFeePercent"
                required
                value={formData.serviceFeePercent}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Biaya Flat Tambahan (IDR)</label>
              <input
                type="number"
                name="flatServiceFee"
                value={formData.flatServiceFee}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Status Awal Trip *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-bold text-slate-800"
              >
                <option value="OPEN">Langsung Buka PO (OPEN)</option>
                <option value="PUBLISHED">Published (Terlihat tapi belum buka)</option>
                <option value="DRAFT">Simpan sebagai Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Syarat & Ketentuan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Syarat, Ketentuan & Catatan Trip
          </h2>
          <textarea
            name="termsAndNotes"
            rows={4}
            value={formData.termsAndNotes}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/trips"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Publikasikan Trip"}
          </button>
        </div>
      </form>
    </div>
  );
}
