"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plane, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    authError === "UnauthorizedAdminAccess"
      ? "Akses ditolak: Halaman tersebut memerlukan akun Administrator."
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMessage("Email atau password yang Anda masukkan salah.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem saat mencoba masuk.");
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
          Selamat Datang Kembali
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Masuk ke akun Anda untuk melacak pesanan dan belanja jastip
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Username / Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username atau email Anda"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Memproses...</span>
          ) : (
            <>
              <span>Masuk ke Akun</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Belum memiliki akun?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-bold text-indigo-600 hover:text-indigo-700"
        >
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-500 text-sm">Memuat halaman login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
