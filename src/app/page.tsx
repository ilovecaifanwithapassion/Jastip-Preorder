import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getExchangeRate, calculatePricingBreakdown } from "@/lib/currency";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { CurrencyConversionSection } from "@/components/CurrencyConversionSection";
import {
  Plane,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Calendar,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Query active & published trips from database (DRAFT is excluded)
  const trips = await prisma.trip.findMany({
    where: {
      status: {
        in: ["OPEN", "PUBLISHED"],
      },
    },
    include: {
      products: {
        where: {
          availabilityStatus: { not: "UNAVAILABLE" },
        },
        take: 3,
      },
    },
    orderBy: { departureDate: "asc" },
  });

  // Calculate live exchange rates and pricing for each trip
  const tripsWithRates = await Promise.all(
    trips.map(async (trip) => {
      const rateResult = await getExchangeRate(trip.purchaseCurrency, "IDR", {
        rateMode: trip.exchangeRateMode,
        tripManualRate: trip.manualExchangeRate,
      });

      const productsWithPricing = trip.products.map((prod) => {
        const pricing = calculatePricingBreakdown({
          originalPrice: prod.originalPrice,
          originalCurrency: prod.originalCurrency,
          targetCurrency: "IDR",
          rateResult,
          serviceFeePercent: trip.serviceFeePercent,
          flatServiceFee: trip.flatServiceFee,
        });

        let images: string[] = [];
        try {
          images = JSON.parse(prod.images);
        } catch {
          images = [];
        }

        return {
          ...prod,
          pricing,
          imageUrl: images[0] || "/placeholder-product.jpg",
        };
      });

      return {
        ...trip,
        rateResult,
        productsWithPricing,
      };
    })
  );

  const whatsappGeneralUrl = getWhatsAppSupportUrl({ type: "GENERAL" });

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trip-Based Personal Shopping Service</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Titip Belanja Luar Negeri dengan{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Kurs Real-Time
              </span>{" "}
              & 100% Transparan
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Belanja produk impian dari butik dan official store Singapura, Jepang, Korea, dan berbagai negara. Dibeli langsung saat jadwal trip, dengan bukti struk resmi dan estimasi kurs live terverifikasi.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/trips"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
              >
                <Plane className="w-5 h-5 -rotate-45" />
                <span>Lihat Shopping Trips Terbuka</span>
              </Link>
              <Link
                href="/custom-request"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition-all"
              >
                <span>Ajukan Custom Request</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Value Props Pills */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left text-xs">
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700">100% Hand-Carried Asli</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Kurs Live Otomatis</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-xs col-span-2 sm:col-span-1 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Pelacakan Status Real-Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Active Trips Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Plane className="w-4 h-4" />
              <span>Jadwal Perjalanan Mendatang</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Trips Aktif
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih trip tujuan Anda sebelum batas waktu order (deadline) ditutup.
            </p>
          </div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Lihat Semua Trips</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {tripsWithRates.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Belum Ada Trip Aktif Saat Ini</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Owner sedang merencanakan jadwal belanja berikutnya. Anda dapat mengajukan request titip barang terlebih dahulu.
            </p>
            <div className="mt-4">
              <Link
                href="/custom-request"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-sm"
              >
                Ajukan Titip Barang
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tripsWithRates.map((trip) => {
              const deadlineDate = new Date(trip.orderDeadline);
              const returnDate = new Date(trip.returnDate);
              const isPastDeadline = deadlineDate < new Date();

              return (
                <div
                  key={trip.id}
                  className="group rounded-3xl overflow-hidden glass-panel hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between border border-slate-200/80"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-indigo-600" />
                          <span>{trip.destinationCity}, {trip.destinationCountry}</span>
                        </span>
                        {isPastDeadline ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                            Order Ditutup
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                            Open Orders
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <LiveRateBadge
                          fromCurrency={trip.purchaseCurrency}
                          toCurrency="IDR"
                          rate={trip.rateResult.rate}
                          source={trip.rateResult.source}
                          isStale={trip.rateResult.isStale}
                          retrievedAt={trip.rateResult.retrievedAt}
                          className="bg-white/90 backdrop-blur-md shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {trip.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {trip.description}
                        </p>
                      </div>

                      {/* Travel Schedule Meta */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Order Deadline
                          </p>
                          <p className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {deadlineDate.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Estimasi Tiba
                          </p>
                          <p className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                              {returnDate.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Sample Products Pills */}
                      {trip.productsWithPricing.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Produk Populer ({trip.productsWithPricing.length}):
                          </p>
                          <div className="space-y-1">
                            {trip.productsWithPricing.slice(0, 2).map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                              >
                                <span className="text-slate-600 truncate max-w-[170px]">
                                  {p.name}
                                </span>
                                <span className="font-bold text-slate-900">
                                  {p.pricing.formattedConvertedProduct}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm transition-colors shadow-sm"
                    >
                      <span>Lihat Detail Trip & Katalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Live Currency Conversion & Calculator Section */}
      <CurrencyConversionSection />

      {/* 4. How It Works Section */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">
              Transparan & Terpercaya
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Cara Kerja JastipPreorder
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Proses mudah dari pemilihan barang hingga pesanan sampai di tangan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass-panel p-6 rounded-3xl relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md shadow-indigo-600/30">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Pilih Trip & Produk</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih dari katalog trip yang tersedia atau ajukan titip barang khusus (custom request) dengan link/foto.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md shadow-indigo-600/30">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Konfirmasi & Pembayaran</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem menghitung konversi kurs real-time & rincian biaya transparan. Lakukan pembayaran aman sesuai instruksi.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md shadow-indigo-600/30">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Traveler Berbelanja</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Owner membeli barang pesanan langsung di toko resmi luar negeri selama tanggal perjalanan.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md shadow-indigo-600/30">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900">Pengiriman ke Alamat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setelah traveler kembali ke Indonesia, barang dipacking aman dan dikirim ke alamat rumah Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WhatsApp Help CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Dukungan Pelanggan Langsung</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ingin Menitip Barang yang Tidak Ada di Katalog?
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Tim kami siap membantu memeriksa ketersediaan barang dan memberikan estimasi harga langsung via chat WhatsApp resmi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <a
              href={whatsappGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all hover:scale-102 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Hubungi Admin WhatsApp</span>
            </a>
            <Link
              href="/custom-request"
              className="px-6 py-3.5 rounded-2xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-400/30 transition-colors"
            >
              Form Custom Request
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions (FAQ)
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl glass-panel space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>Bagaimana kurs mata uang dihitung?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
              Website kami terintegrasi dengan penyedia nilai tukar valuta asing (Frankfurter / European Central Bank) yang memperbarui kurs secara berkala. Saat checkout pesanan terkonfirmasi, kurs tersebut dikunci secara permanen pada invoice pesanan Anda sehingga harga tidak akan berubah jika kurs berfluktuasi kemudian.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>Bagaimana jika barang yang dititipkan habis di toko?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
              Jika stok barang tidak tersedia di gerai resmi selama jadwal trip, dana pesanan Anda akan dikembalikan (refund) 100% sesuai kebijakan refund kami. Traveler akan mengabari ketersediaan barang melalui sistem status dan WhatsApp.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>Apakah produk dijamin keasliannya?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
              Ya, 100% original. Barang dibeli langsung dari gerai resmi, mall ternama, atau bandara duty-free store di negara tujuan. Bukti pembelian/receipt dapat disertakan atas permintaan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
