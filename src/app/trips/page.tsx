import React from "react";
import Link from "next/link";
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
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open Pemesanan", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  PUBLISHED: { label: "Segera Dibuka", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CLOSED: { label: "Ditutup", color: "bg-slate-100 text-slate-500 border-slate-200" },
  IN_PROGRESS: { label: "Sedang Belanja", color: "bg-violet-100 text-violet-700 border-violet-200" },
  COMPLETED: { label: "Selesai", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    where: {
      status: { in: ["OPEN", "PUBLISHED", "CLOSED", "IN_PROGRESS", "COMPLETED"] },
    },
    include: {
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { departureDate: "asc" },
  });

  const tripsWithRates = await Promise.all(
    trips.map(async (trip) => {
      const rateResult = await getExchangeRate(trip.purchaseCurrency, "IDR", {
        rateMode: trip.exchangeRateMode,
        tripManualRate: trip.manualExchangeRate,
      });
      return { ...trip, rateResult };
    })
  );

  const openTrips = tripsWithRates.filter((t) => t.status === "OPEN");
  const otherTrips = tripsWithRates.filter((t) => t.status !== "OPEN");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Plane className="w-3.5 h-3.5" />
          <span>Shopping Trips</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Semua Jadwal Perjalanan Belanja
        </h1>
        <p className="text-sm text-slate-500">
          Pilih trip yang sesuai dan titipkan barang impian Anda sebelum batas waktu pemesanan ditutup.
        </p>
      </div>

      {/* Open Trips */}
      {openTrips.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">Sedang Dibuka untuk Pemesanan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {/* Other Trips */}
      {otherTrips.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Trip Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {trips.length === 0 && (
        <div className="py-24 text-center space-y-4">
          <Plane className="w-14 h-14 text-slate-200 mx-auto" />
          <h3 className="text-xl font-bold text-slate-600">Belum Ada Trip yang Dipublikasikan</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Owner sedang merencanakan jadwal belanja berikutnya. Ajukan custom request untuk barang yang Anda inginkan.
          </p>
          <Link
            href="/custom-request"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            Ajukan Custom Request
          </Link>
        </div>
      )}
    </div>
  );
}

function TripCard({ trip }: { trip: any }) {
  const status = STATUS_LABELS[trip.status] || { label: trip.status, color: "bg-slate-100 text-slate-500 border-slate-200" };
  const isOpen = trip.status === "OPEN";
  const deadlineDate = new Date(trip.orderDeadline);
  const isPastDeadline = deadlineDate < new Date();
  const whatsappUrl = getWhatsAppSupportUrl({
    type: "TRIP_INQUIRY",
    tripTitle: trip.title,
  });

  return (
    <div className="group flex flex-col rounded-3xl overflow-hidden glass-panel border border-slate-200/80 hover:shadow-xl hover:shadow-indigo-500/8 transition-all">
      {/* Cover */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
        {trip.coverImage && (
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-slate-800 shadow-sm">
            <MapPin className="w-3 h-3 text-indigo-600" />
            {trip.destinationCity}, {trip.destinationCountry}
          </span>
        </div>
        {trip.rateResult && (
          <div className="absolute bottom-3 right-3">
            <LiveRateBadge
              fromCurrency={trip.purchaseCurrency}
              toCurrency="IDR"
              rate={trip.rateResult.rate}
              source={trip.rateResult.source}
              isStale={trip.rateResult.isStale}
              retrievedAt={trip.rateResult.retrievedAt}
              showDetails={false}
              className="bg-white/90 backdrop-blur-md shadow-sm text-[11px]"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 space-y-3">
        <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
          {trip.title}
        </h3>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Deadline Order</p>
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              {deadlineDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Estimasi Tiba</p>
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-500" />
              {new Date(trip.estimatedDeliveryDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {trip._count.products} produk
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {trip._count.orders} pesanan
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 pt-0 flex gap-2">
        <Link
          href={`/trips/${trip.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <span>Lihat Detail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {isOpen && !isPastDeadline && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors"
            title="Tanya via WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
