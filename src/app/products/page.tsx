"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  ShoppingCart,
  Check,
  Plane,
  Tag,
  ArrowUpDown,
  Sparkles,
  MessageSquare,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string | null;
  sourceStore: string | null;
  originalPrice: number;
  originalCurrency: string;
  quantityLimit: number | null;
  availabilityStatus: string;
  images: string;
  trip: {
    id: string;
    title: string;
    destinationCountry: string;
    destinationCity: string;
    purchaseCurrency: string;
    exchangeRateMode: string;
    manualExchangeRate: number | null;
    serviceFeePercent: number;
    flatServiceFee: number;
    status: string;
    orderDeadline: string;
  };
  variants: Array<{
    id: string;
    name: string;
    priceAdjustment: number;
  }>;
}

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const tripParam = searchParams.get("tripId") || "ALL";

  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(tripParam);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [ratesMap, setRatesMap] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data: ProductItem[] = await res.json();
          setProducts(data);

          // Collect unique currencies
          const currencies = Array.from(new Set(data.map((p) => p.originalCurrency)));
          const rates: Record<string, number> = {};

          await Promise.all(
            currencies.map(async (curr) => {
              if (curr === "IDR") {
                rates[curr] = 1;
                return;
              }
              try {
                const rRes = await fetch(`/api/rates?from=${curr}&to=IDR`);
                if (rRes.ok) {
                  const rData = await rRes.json();
                  rates[curr] = rData.rate;
                }
              } catch (e) {
                // Fallbacks if rate API is offline
                if (curr === "JPY") rates[curr] = 106.5;
                if (curr === "SGD") rates[curr] = 11950;
                if (curr === "USD") rates[curr] = 16200;
                if (curr === "KRW") rates[curr] = 11.8;
                if (curr === "THB") rates[curr] = 445;
              }
            })
          );
          setRatesMap(rates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute estimated IDR price for a product
  const getEstimatedIDR = (product: ProductItem) => {
    let rate = 1;
    if (product.trip.exchangeRateMode === "MANUAL_OVERRIDE" && product.trip.manualExchangeRate) {
      rate = product.trip.manualExchangeRate;
    } else if (ratesMap[product.originalCurrency]) {
      rate = ratesMap[product.originalCurrency];
    } else {
      // Default fallback estimation
      if (product.originalCurrency === "JPY") rate = 106.5;
      else if (product.originalCurrency === "SGD") rate = 11950;
      else if (product.originalCurrency === "USD") rate = 16200;
      else rate = 10000;
    }

    const baseIDR = product.originalPrice * rate;
    const fee = baseIDR * (product.trip.serviceFeePercent / 100) + product.trip.flatServiceFee;
    return Math.round(baseIDR + fee);
  };

  const handleAddToCart = (product: ProductItem) => {
    let imgUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
    } catch (e) {
      if (product.images.startsWith("http")) imgUrl = product.images;
    }

    const estimatedIDR = getEstimatedIDR(product);

    addItem({
      productId: product.id,
      tripId: product.trip.id,
      tripTitle: product.trip.title,
      name: product.name,
      variantId: product.variants[0]?.id || undefined,
      variantName: product.variants[0]?.name || undefined,
      originalPrice: product.originalPrice,
      originalCurrency: product.originalCurrency,
      priceAdjustment: product.variants[0]?.priceAdjustment || 0,
      quantity: 1,
      image: imgUrl,
      exchangeRate: ratesMap[product.originalCurrency] || 1,
      estimatedUnitPriceIDR: estimatedIDR,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const trips = Array.from(
    new Map(products.map((p) => [p.trip.id, p.trip])).values()
  );

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.sourceStore && p.sourceStore.toLowerCase().includes(q));
      const matchesTrip = selectedTrip === "ALL" || p.trip.id === selectedTrip;
      const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
      return matchesSearch && matchesTrip && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === "PRICE_ASC") return getEstimatedIDR(a) - getEstimatedIDR(b);
      if (sortBy === "PRICE_DESC") return getEstimatedIDR(b) - getEstimatedIDR(a);
      return 0; // default order
    });

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Original & Hand-Carried Items
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Katalog Produk Pre-Order Luar Negeri
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Pilih produk favorit dari Jepang, Singapura, Korea, dan negara lainnya. Harga dikonversi otomatis dengan estimasi kurs live European Central Bank.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Search & Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk, merk, store..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Trip Filter */}
            <div>
              <select
                value={selectedTrip}
                onChange={(e) => setSelectedTrip(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Shopping Trips ({trips.length})</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    Trip {t.destinationCity}, {t.destinationCountry} - {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NEWEST">Terbaru Ditambahkan</option>
                <option value="PRICE_ASC">Harga Terendah &rarr; Tertinggi</option>
                <option value="PRICE_DESC">Harga Tertinggi &rarr; Terendah</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Memuat katalog produk...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Barang yang kamu cari belum ada?</h3>
            <p className="text-xs text-slate-500">
              Tenang, kamu bisa request titip barang apa pun dari luar negeri lewat fitur Custom Purchase Request!
            </p>
            <Link
              href="/custom-request"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              <MessageSquare className="w-4 h-4" />
              Ajukan Custom Request Titip Beli
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              let imgUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
              try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
              } catch (e) {
                if (product.images.startsWith("http")) imgUrl = product.images;
              }

              const estimatedIDR = getEstimatedIDR(product);
              const isAvailable = product.availabilityStatus === "AVAILABLE" || product.availabilityStatus === "LIMITED";
              const isAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Trip Destination Badge */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Plane className="w-3 h-3 text-indigo-400" />
                        {product.trip.destinationCity}
                      </span>
                      {product.brand && (
                        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold shadow-sm">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                          {product.category}
                        </p>
                        <Link
                          href={`/products/${product.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Foreign Retail Price & Converted IDR */}
                      <div className="pt-1 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400">
                          Harga Asal:{" "}
                          <span className="font-semibold text-slate-600">
                            {product.originalCurrency} {product.originalPrice.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-base font-black text-indigo-700 mt-0.5">
                          Rp {estimatedIDR.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          *Termasuk jastip fee {product.trip.serviceFeePercent}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isAvailable}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                        !isAvailable
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : isAdded
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-900 hover:bg-indigo-600 text-white shadow-sm"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Berhasil Ditambahkan!
                        </>
                      ) : !isAvailable ? (
                        "Stok Habis"
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" /> Tambah ke Keranjang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Request Promo Card */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black">Mau Titip Barang Lain yang Tidak Ada di Katalog?</h3>
            <p className="text-xs text-indigo-200 max-w-xl">
              Cukup kirimkan link web, foto produk, atau nama barang yang kamu inginkan. Tim kami akan mengecek harga di toko fisik luar negeri dan memberikan penawaran harga terbaik.
            </p>
          </div>
          <Link
            href="/custom-request"
            className="flex-shrink-0 px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-2xl font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Ajukan Request Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center bg-slate-50 min-h-screen">
          <p className="text-sm font-medium text-slate-500">Memuat katalog produk...</p>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
