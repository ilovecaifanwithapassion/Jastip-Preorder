"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  MessageCircle,
  CreditCard,
  DollarSign,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bell,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e: any) {
      setErrorMsg("Gagal memuat pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan.");
      setSuccessMsg("Pengaturan sistem berhasil disimpan!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshRatesCache = async () => {
    setRefreshingRates(true);
    try {
      const res = await fetch("/api/rates?from=SGD&to=IDR&forceRefresh=true");
      if (res.ok) {
        alert("Cache kurs berhasil diperbarui dari European Central Bank!");
      } else {
        alert("Gagal memperbarui kurs live.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setRefreshingRates(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Memuat pengaturan sistem...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Pengaturan Sistem & Bisnis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi nomor WhatsApp CS, instruksi rekening bank transfer, dan buffer proteksi kurs.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: WhatsApp Support */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            Integrasi WhatsApp Customer Care
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Nomor WhatsApp Bisnis (Format 62xxx) *
              </label>
              <input
                type="text"
                name="whatsapp_number"
                required
                placeholder="6281234567890"
                value={settings.whatsapp_number || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <p className="text-[11px] text-slate-400">
                Digunakan untuk tombol chat WhatsApp otomatis di invoice, status order, dan bantuan pelanggan.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Petugas / Support</label>
              <input
                type="text"
                name="whatsapp_support_name"
                placeholder="Customer Care JastipPreorder"
                value={settings.whatsapp_support_name || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Rekening Bank Transfer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Rekening Pembayaran Manual (Instruksi Transfer)
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">No. Rekening Bank BCA</label>
                <input
                  type="text"
                  name="bank_bca_account"
                  placeholder="1234567890"
                  value={settings.bank_bca_account || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Atas Nama (BCA)</label>
                <input
                  type="text"
                  name="bank_bca_name"
                  placeholder="PT Jastip Global Indonesia"
                  value={settings.bank_bca_name || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">No. Rekening Bank Mandiri</label>
                <input
                  type="text"
                  name="bank_mandiri_account"
                  placeholder="9876543210"
                  value={settings.bank_mandiri_account || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Atas Nama (Mandiri)</label>
                <input
                  type="text"
                  name="bank_mandiri_name"
                  placeholder="PT Jastip Global Indonesia"
                  value={settings.bank_mandiri_name || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Kurs & Pengumuman */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            Proteksi Kurs & Pengumuman
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Buffer Margin Kurs Valas (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="exchange_rate_buffer_percent"
                placeholder="2.5"
                value={settings.exchange_rate_buffer_percent || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <p className="text-[11px] text-slate-400">
                Margin pengaman fluktuasi nilai tukar bank komersial.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Paksa Perbarui Cache Kurs Live</label>
              <button
                type="button"
                onClick={handleRefreshRatesCache}
                disabled={refreshingRates}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingRates ? "animate-spin" : ""}`} />
                {refreshingRates ? "Mengambil Data..." : "Refresh Kurs dari ECB"}
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-slate-700">
              Pesan Pengumuman Beranda (Banner Bar)
            </label>
            <input
              type="text"
              name="announcement_banner"
              placeholder="Open PO Japan Cherry Blossom Shopping! Kuota terbatas."
              value={settings.announcement_banner || ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
