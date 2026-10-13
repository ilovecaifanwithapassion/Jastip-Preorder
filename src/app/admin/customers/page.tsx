"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  totalRequests: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Daftar Pelanggan Terdaftar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat kontak pelanggan, riwayat loyalitas, frekuensi belanja, dan total transaksi jastip.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, nomor HP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Total: {customers.length} akun
        </span>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat data pelanggan...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada pelanggan ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Kontak (WhatsApp & Email)</th>
                  <th className="py-3.5 px-4">Bergabung</th>
                  <th className="py-3.5 px-4 text-center">Total Pesanan</th>
                  <th className="py-3.5 px-4 text-center">Custom Request</th>
                  <th className="py-3.5 px-4 text-right">Total Belanja (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filtered.map((c) => {
                  const cleanPhone = c.phone.replace(/[^0-9]/g, "");
                  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                  const waUrl = cleanPhone.length > 5
                    ? `https://wa.me/${waNumber}?text=Halo%20kak%20${encodeURIComponent(c.name)},%20salam%20dari%20tim%20JastipPreorder!`
                    : null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-400">ID: {c.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs space-y-1">
                          <p className="text-slate-600 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {c.email}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700 font-medium">{c.phone}</span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat WhatsApp"
                                className="text-emerald-600 hover:text-emerald-700 font-bold ml-1"
                              >
                                <MessageCircle className="w-3.5 h-3.5 inline" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                          <ShoppingBag className="w-3 h-3" />
                          {c.totalOrders}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                          {c.totalRequests}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="font-black text-slate-900 text-sm">
                          Rp {c.totalSpent.toLocaleString("id-ID")}
                        </span>
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
