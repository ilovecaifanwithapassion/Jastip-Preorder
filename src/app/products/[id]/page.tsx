import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getExchangeRate, calculatePricingBreakdown, formatCurrency } from "@/lib/currency";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  Tag,
  ChevronRight,
  MessageCircle,
  Star,
  AlertCircle,
  Store,
} from "lucide-react";

export const dynamic = "force-dynamic";

const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: "Tersedia", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  LIMITED: { label: "Terbatas", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  OUT_OF_STOCK: { label: "Habis", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  UNAVAILABLE: { label: "Tidak Tersedia", color: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
};

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: { orderBy: { name: "asc" } },
      trip: true,
    },
  });

  if (!product) {
    notFound();
  }

  if (product.trip.status === "DRAFT" || product.trip.status === "CANCELLED") {
    notFound();
  }

  const rateResult = await getExchangeRate(product.originalCurrency, "IDR", {
    rateMode: product.trip.exchangeRateMode,
    tripManualRate: product.trip.manualExchangeRate,
  });

  const pricing = calculatePricingBreakdown({
    originalPrice: product.originalPrice,
    originalCurrency: product.originalCurrency,
    targetCurrency: "IDR",
    rateResult,
    serviceFeePercent: product.trip.serviceFeePercent,
    flatServiceFee: product.trip.flatServiceFee,
  });

  const session = await getServerSession(authOptions);
  const isOpen = product.trip.status === "OPEN";
  const isPastDeadline = new Date(product.trip.orderDeadline) < new Date();
  const canOrder = isOpen && !isPastDeadline;
  const avail = AVAIL_LABELS[product.availabilityStatus] || { label: product.availabilityStatus, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" };

  const images = (() => { try { return JSON.parse(product.images) as string[]; } catch { return []; } })();

  const whatsappUrl = getWhatsAppSupportUrl({
    type: "TRIP_INQUIRY",
    tripTitle: product.trip.title,
    productName: product.name,
  });

  const checkoutUrl = canOrder
    ? `/checkout?tripId=${product.tripId}&productId=${product.id}`
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
        <Link href="/" className="hover:text-slate-600 transition-colors">Beranda</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/trips" className="hover:text-slate-600 transition-colors">Trips</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/trips/${product.tripId}`} className="hover:text-slate-600 transition-colors truncate max-w-xs">{product.trip.title}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
            {images[0] ? (
              <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-slate-300" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${avail.bg} ${avail.color}`}>
                {avail.label}
              </span>
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors">
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{product.brand}</p>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{product.category}</span>
              {product.sourceStore && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  {product.sourceStore}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Pricing */}
          <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              Rincian Harga
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Harga Asli</span>
                <span className="font-semibold text-slate-800">{formatCurrency(product.originalPrice, product.originalCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Konversi ke IDR (×{rateResult.rate.toLocaleString("id-ID", { maximumFractionDigits: 0 })})</span>
                <span className="font-semibold text-slate-800">{pricing.formattedConvertedProduct}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jasa Titip ({product.trip.serviceFeePercent}%)</span>
                <span className="font-semibold text-slate-800">{pricing.formattedServiceFee}</span>
              </div>
              <hr className="border-indigo-200" />
              <div className="flex justify-between">
                <span className="font-bold text-slate-800">Estimasi Total</span>
                <span className="font-extrabold text-xl text-indigo-700">{pricing.formattedTotal}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Rate: 1 {product.originalCurrency} ≈ {formatCurrency(rateResult.rate, "IDR")} ({rateResult.source === "ADMIN_OVERRIDE" ? "Manual Admin" : "Live Market"})
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-sm">Pilihan Varian</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <div key={v.id} className="px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 cursor-default">
                    {v.name}
                    {v.priceAdjustment !== 0 && (
                      <span className="ml-1.5 text-xs text-indigo-500">
                        {v.priceAdjustment > 0 ? "+" : ""}{formatCurrency(v.priceAdjustment * rateResult.rate, "IDR")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Pilih varian saat checkout</p>
            </div>
          )}

          {/* Quantity Limit */}
          {product.quantityLimit && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Maks. <strong>{product.quantityLimit}</strong> unit per customer</span>
            </div>
          )}

          {/* Reference Link */}
          {product.externalUrl && (
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Lihat referensi produk original
            </a>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {canOrder && product.availabilityStatus !== "OUT_OF_STOCK" && product.availabilityStatus !== "UNAVAILABLE" ? (
              <>
                {session ? (
                  <Link
                    href={checkoutUrl!}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Pesan Sekarang
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Login untuk Memesan
                  </Link>
                )}
                <Link
                  href={`/custom-request?tripId=${product.tripId}&productName=${encodeURIComponent(product.name)}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-sm transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  Custom Request Varian Khusus
                </Link>
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed">
                  {product.availabilityStatus === "OUT_OF_STOCK" ? "Stok Habis" :
                   product.availabilityStatus === "UNAVAILABLE" ? "Tidak Tersedia" :
                   isPastDeadline ? "Deadline Telah Lewat" : "Pemesanan Belum Dibuka"}
                </div>
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

          {/* Trip Info */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Bagian dari Trip</p>
            <Link href={`/trips/${product.tripId}`} className="flex items-center justify-between hover:text-indigo-600 transition-colors group">
              <div>
                <p className="font-bold text-slate-900 group-hover:text-indigo-600 text-sm">{product.trip.title}</p>
                <p className="text-xs text-slate-400">{product.trip.destinationCity}, {product.trip.destinationCountry}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href={`/trips/${product.tripId}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke {product.trip.title}
        </Link>
      </div>
    </div>
  );
}
