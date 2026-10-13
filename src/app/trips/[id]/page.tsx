import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getExchangeRate, calculatePricingBreakdown, formatCurrency } from "@/lib/currency";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";
import {
  Plane,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  Package,
  MessageCircle,
  Tag,
  Star,
  ChevronRight,
  ShoppingBag,
  Info,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: "Open Pemesanan", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  PUBLISHED: { label: "Segera Dibuka", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  CLOSED: { label: "Ditutup", color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
  IN_PROGRESS: { label: "Sedang Belanja", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  COMPLETED: { label: "Selesai", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-500", bg: "bg-red-50 border-red-200" },
};

const AVAIL_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Tersedia", color: "text-emerald-600" },
  LIMITED: { label: "Terbatas", color: "text-amber-600" },
  OUT_OF_STOCK: { label: "Habis", color: "text-red-500" },
  UNAVAILABLE: { label: "Tidak Tersedia", color: "text-slate-400" },
};

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      products: {
        include: { variants: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!trip || trip.status === "DRAFT" || trip.status === "CANCELLED") {
    notFound();
  }

  const rateResult = await getExchangeRate(trip.purchaseCurrency, "IDR", {
    rateMode: trip.exchangeRateMode,
    tripManualRate: trip.manualExchangeRate,
  });

  const status = STATUS_LABELS[trip.status] || { label: trip.status, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" };
  const isOpen = trip.status === "OPEN";
  const deadlineDate = new Date(trip.orderDeadline);
  const isPastDeadline = deadlineDate < new Date();
  const canOrder = isOpen && !isPastDeadline;

  const whatsappUrl = getWhatsAppSupportUrl({
    type: "TRIP_INQUIRY",
    tripTitle: trip.title,
  });

  const categories = Array.from(new Set(trip.products.map((p) => p.category)));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-gradient-to-br from-indigo-800 to-violet-900">
        {trip.coverImage && (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/trips" className="hover:text-white transition-colors">Shopping Trips</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 truncate max-w-xs">{trip.title}</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                  <MapPin className="w-3 h-3" />
                  {trip.destinationCity}, {trip.destinationCountry}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{trip.title}</h1>
            </div>
            {rateResult && (
              <div className="flex-shrink-0">
                <LiveRateBadge
                  fromCurrency={trip.purchaseCurrency}
                  toCurrency="IDR"
                  rate={rateResult.rate}
                  source={rateResult.source}
                  isStale={rateResult.isStale}
                  retrievedAt={rateResult.retrievedAt}
                  showDetails={true}
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Deadline Order", value: deadlineDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }), icon: Clock, highlight: canOrder },
                { label: "Tgl Berangkat", value: new Date(trip.departureDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" }), icon: Plane },
                { label: "Tgl Kembali", value: new Date(trip.returnDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" }), icon: Calendar },
                { label: "Est. Tiba di ID", value: new Date(trip.estimatedDeliveryDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" }), icon: Package },
              ].map(({ label, value, icon: Icon, highlight }) => (
                <div key={label} className={`p-4 rounded-2xl border ${highlight ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"} space-y-1`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Icon className={`w-3.5 h-3.5 ${highlight ? "text-amber-500" : "text-indigo-500"}`} />
                    {label}
                  </p>
                  <p className={`text-sm font-bold ${highlight ? "text-amber-700" : "text-slate-900"}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {trip.description && (
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  Tentang Trip Ini
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{trip.description}</p>
              </div>
            )}

            {/* Terms */}
            {trip.termsAndNotes && (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <h2 className="font-bold text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Ketentuan & Catatan
                </h2>
                <p className="text-sm text-amber-700 leading-relaxed whitespace-pre-wrap">{trip.termsAndNotes}</p>
              </div>
            )}

            {/* Products */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  Produk Tersedia ({trip.products.length})
                </h2>
              </div>

              {/* Category Tabs (display only) */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span key={cat} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {trip.products.length === 0 && (
                <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Produk belum ditambahkan</p>
                  <p className="text-xs text-slate-400 mt-1">Admin masih melengkapi katalog.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trip.products.map((product) => {
                  const images = (() => { try { return JSON.parse(product.images) as string[]; } catch { return []; } })();
                  const pricing = calculatePricingBreakdown({
                    originalPrice: product.originalPrice,
                    originalCurrency: product.originalCurrency,
                    targetCurrency: "IDR",
                    rateResult,
                    serviceFeePercent: trip.serviceFeePercent,
                    flatServiceFee: trip.flatServiceFee,
                  });
                  const avail = AVAIL_LABELS[product.availabilityStatus] || { label: product.availabilityStatus, color: "text-slate-500" };

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group flex flex-col rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-indigo-200 transition-all overflow-hidden"
                    >
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        {images[0] ? (
                          <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 shadow-sm ${avail.color}`}>
                            {avail.label}
                          </span>
                        </div>
                        {product.brand && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                              {product.brand}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</p>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <p className="text-[11px] text-slate-400">Harga asal: <span className="font-semibold text-slate-600">{formatCurrency(product.originalPrice, product.originalCurrency)}</span></p>
                          <p className="text-base font-extrabold text-indigo-700">{pricing.formattedTotal}</p>
                          <p className="text-[10px] text-slate-400">estimasi total (termasuk jasa {trip.serviceFeePercent}%)</p>
                        </div>
                        {product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {product.variants.slice(0, 4).map((v) => (
                              <span key={v.id} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 font-medium">{v.name}</span>
                            ))}
                            {product.variants.length > 4 && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 text-slate-500">+{product.variants.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="px-4 pb-4">
                        <span className="flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Lihat & Pesan
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Order Box */}
            <div className="sticky top-24 space-y-4">
              <div className={`p-5 rounded-3xl border-2 ${canOrder ? "border-emerald-300 bg-gradient-to-b from-emerald-50 to-white" : "border-slate-200 bg-white"} shadow-md space-y-4`}>
                {canOrder && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500 text-white">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-bold">Pemesanan Sedang Dibuka!</span>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-bold text-slate-800">{trip.serviceFeePercent}%{trip.flatServiceFee > 0 ? ` + ${formatCurrency(trip.flatServiceFee, "IDR")}` : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Currency</span>
                    <span className="font-bold text-slate-800">{trip.purchaseCurrency} → IDR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kurs Rate</span>
                    <span className="font-bold text-slate-800">{formatCurrency(rateResult.rate, "IDR")}</span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {!isPastDeadline && isOpen && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-700 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Deadline Order:
                    </p>
                    <p className="text-sm font-extrabold text-amber-800 mt-1">
                      {deadlineDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}

                {canOrder ? (
                  <div className="space-y-2">
                    <Link
                      href={`/checkout?tripId=${trip.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Pesan Sekarang
                    </Link>
                    <Link
                      href={`/custom-request?tripId=${trip.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-sm transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                      Custom Request
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-center text-slate-500 font-medium">
                      {isPastDeadline ? "Deadline pemesanan telah lewat." : "Pemesanan belum dibuka."}
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Tanya via WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-indigo-50">
                    <p className="text-2xl font-extrabold text-indigo-700">{trip.products.length}</p>
                    <p className="text-xs text-indigo-500 font-medium">Produk</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50">
                    <p className="text-2xl font-extrabold text-violet-700">{trip._count.orders}</p>
                    <p className="text-xs text-violet-500 font-medium">Pesanan</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">Ada Pertanyaan?</p>
                  <p className="text-xs text-emerald-600">Chat langsung dengan admin via WhatsApp</p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
