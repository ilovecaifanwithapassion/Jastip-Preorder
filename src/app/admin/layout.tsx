import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Plane,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Settings,
  Users,
  Package,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/trips", label: "Kelola Trip", icon: Plane },
  { href: "/admin/products", label: "Kelola Produk", icon: Package },
  { href: "/admin/orders", label: "Kelola Pesanan", icon: ShoppingCart },
  { href: "/admin/payments", label: "Verifikasi Bayar", icon: CreditCard },
  { href: "/admin/custom-requests", label: "Custom Requests", icon: MessageSquare },
  { href: "/admin/customers", label: "Pelanggan", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-slate-900 text-white flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-white text-sm leading-tight">Jastip Admin</p>
              <p className="text-[10px] text-slate-400 truncate">{(session.user as any).name}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors group"
            >
              <item.icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-slate-700">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            Kembali ke Situs
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
