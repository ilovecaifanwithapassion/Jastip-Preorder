"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plane, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal membuat akun.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Auto sign in with credentials
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!signInRes?.error) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        router.push("/login?message=AccountCreated");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan koneksi saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4">
          <Plane className="w-6 h-6 -rotate-45" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Buat Akun Pelanggan
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Daftar untuk mulai memesan barang jastip & melacak progres pembelian
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>Akun berhasil dibuat! Mengalihkan ke halaman berikutnya...</span>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ariel Sutedjo"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nomor WhatsApp / HP
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all bg-white"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Digunakan untuk konfirmasi pesanan dan update kurir pengiriman.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password (Min. 6 Karakter)
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Membuat akun...</span>
          ) : (
            <>
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Sudah memiliki akun?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-bold text-indigo-600 hover:text-indigo-700"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-500 text-sm">Memuat form pendaftaran...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
