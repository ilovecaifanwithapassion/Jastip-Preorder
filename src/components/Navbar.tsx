"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";
import {
  ShoppingBag,
  Plane,
  Compass,
  FileQuestion,
  MessageCircle,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  PackageCheck,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const whatsappUrl = getWhatsAppSupportUrl({ type: "GENERAL" });

  const navLinks = [
    { name: "Trips", href: "/trips", icon: Plane },
    { name: "Katalog", href: "/products", icon: Compass },
    { name: "Kurs Live", href: "/#kurs", icon: TrendingUp },
    { name: "Custom Request", href: "/custom-request", icon: FileQuestion },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                JastipPreorder
              </span>
              <span className="text-[10px] text-slate-500 -mt-1 font-medium tracking-wide">
                Authentic Worldwide Shopping
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/80 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* WhatsApp Support Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </nav>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center animate-scale-in">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Admin Badge Quick Link (If Admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:from-indigo-700 hover:to-violet-700 transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* User Account Controls */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-semibold">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user.email}
                      </p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">
                          👑 Store Administrator
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-semibold"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <PackageCheck className="w-4 h-4 text-slate-400" />
                        <span>Pesanan Saya (Orders)</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profil Akun</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Log Out)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all shadow-indigo-500/20"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-6 space-y-2 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <Icon className="w-5 h-5 text-indigo-600" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-emerald-600 hover:bg-emerald-50"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat WhatsApp Admin</span>
          </a>

          {!session && (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Daftar Akun Baru
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
