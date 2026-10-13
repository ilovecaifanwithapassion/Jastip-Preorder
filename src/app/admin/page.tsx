import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  LayoutDashboard,
  Plane,
  Package,
  ShoppingCart,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Users,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  const [
    tripsCount,
    openTripsCount,
    totalOrders,
    pendingOrders,
    pendingPayments,
    customRequests,
    totalCustomers,
    recentOrders,
  ] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.count({ where: { status: "OPEN" } }),
    prisma.order.count(),
    prisma.order.count({ where: { fulfillmentStatus: "PENDING_REVIEW" } }),
    prisma.payment.count({ where: { status: "SUBMITTED" } }),
    prisma.customRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        trip: { select: { title: true } },
        pricingSnapshot: { select: { totalPayable: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Total Trip", value: tripsCount, sub: `${openTripsCount} sedang dibuka`, icon: Plane, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/trips" },
    { label: "Total Pesanan", value: totalOrders, sub: `${pendingOrders} perlu review`, icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50", href: "/admin/orders" },
    { label: "Bayar Belum Verif.", value: pendingPayments, sub: "perlu verifikasi", icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/payments" },
    { label: "Custom Request", value: customRequests, sub: "belum direspon", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/custom-requests" },
    { label: "Total Pelanggan", value: totalCustomers, sub: "akun terdaftar", icon: Users, color: "text-sky-600", bg: "bg-sky-50", href: "/admin/customers" },
  ];

  const FULFILLMENT_COLORS: Record<string, string> = {
    PENDING_REVIEW: "text-amber-600",
    AWAITING_PAYMENT: "text-orange-500",
    CONFIRMED: "text-blue-600",
    PURCHASING: "text-violet-600",
    PURCHASED: "text-indigo-600",
    IN_TRANSIT: "text-sky-600",
    ARRIVED: "text-teal-600",
    READY_FOR_DELIVERY: "text-emerald-600",
    COMPLETED: "text-emerald-700",
    CANCELLED: "text-red-500",
    REFUNDED: "text-slate-400",
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">Selamat datang, {(session.user as any).name}. Ini ringkasan bisnis hari ini.</p>
        </div>
        <Link
          href="/admin/trips/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plane className="w-4 h-4" />
          Buat Trip Baru
        </Link>
      </div>

      {/* Alert for urgent items */}
      {(pendingOrders > 0 || pendingPayments > 0 || customRequests > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">Perhatian Diperlukan</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {pendingOrders > 0 && <span className="text-amber-700 text-xs">{pendingOrders} pesanan baru menunggu review</span>}
              {pendingPayments > 0 && <span className="text-amber-700 text-xs">{pendingPayments} pembayaran menunggu verifikasi</span>}
              {customRequests > 0 && <span className="text-amber-700 text-xs">{customRequests} custom request belum direspon</span>}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">{stat.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/trips/new", icon: Plane, label: "Buat Trip Baru", color: "border-indigo-200 bg-indigo-50 text-indigo-700" },
          { href: "/admin/orders", icon: ShoppingCart, label: "Kelola Pesanan", color: "border-violet-200 bg-violet-50 text-violet-700" },
          { href: "/admin/payments", icon: CreditCard, label: "Verif. Pembayaran", color: "border-orange-200 bg-orange-50 text-orange-700" },
          { href: "/admin/custom-requests", icon: MessageSquare, label: "Custom Requests", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center gap-2 p-3.5 rounded-2xl border-2 ${action.color} font-bold text-xs hover:shadow-md transition-all group`}
          >
            <action.icon className="w-4 h-4 flex-shrink-0" />
            <span>{action.label}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Pesanan Terbaru
          </h2>
          <Link href="/admin/orders" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">No. Order</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trip</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[150px]">{order.trip.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${FULFILLMENT_COLORS[order.fulfillmentStatus] || "text-slate-500"}`}>
                        {order.fulfillmentStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {order.pricingSnapshot ? `Rp ${(order.pricingSnapshot.totalPayable / 1000).toFixed(0)}K` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm">Belum ada pesanan.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
