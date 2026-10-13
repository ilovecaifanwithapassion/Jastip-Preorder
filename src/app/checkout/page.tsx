"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

interface TripInfo {
  id: string;
  title: string;
  destinationCity: string;
  destinationCountry: string;
  purchaseCurrency: string;
  serviceFeePercent: number;
  flatServiceFee: number;
  orderDeadline: string;
  estimatedDeliveryDate: string;
  status: string;
}

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  originalCurrency: string;
  availabilityStatus: string;
  quantityLimit: number | null;
  images: string;
  variants: { id: string; name: string; priceAdjustment: number }[];
}

interface PricingResult {
  originalPrice: number;
  originalCurrency: string;
  exchangeRate: number;
  convertedProductPrice: number;
  totalServiceFee: number;
  estimatedTotal: number;
  formattedOriginal: string;
  formattedConvertedProduct: string;
  formattedServiceFee: string;
  formattedTotal: string;
  rateSource: string;
}

interface OrderItem {
  product: ProductInfo;
  variantId?: string;
  variantName?: string;
  quantity: number;
  pricing?: PricingResult;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const tripId = searchParams.get("tripId");
  const productId = searchParams.get("productId");

  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryNotes: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (!tripId) { setError("Trip ID tidak valid."); setLoading(false); return; }
    const fetchData = async () => {
      try {
        const [tripRes, productRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`),
          productId ? fetch(`/api/products/${productId}`) : Promise.resolve(null),
        ]);

        if (!tripRes.ok) throw new Error("Trip tidak ditemukan.");
        const tripData = await tripRes.json();
        setTrip(tripData);

        if (productRes && productRes.ok) {
          const productData = await productRes.json();
          const pricingRes = await fetch(`/api/pricing?productId=${productId}&tripId=${tripId}`);
          const pricingData = pricingRes.ok ? await pricingRes.json() : null;
          setItems([{ product: productData, quantity: 1, pricing: pricingData }]);
        }

        if (session?.user) {
          setForm((prev) => ({
            ...prev,
            customerName: (session.user as any).name || "",
            customerPhone: (session.user as any).phone || "",
          }));
        }
      } catch (e: any) {
        setError(e.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    if (authStatus === "authenticated") fetchData();
  }, [tripId, productId, authStatus, session]);

  const updateQuantity = (idx: number, qty: number) => {
    if (qty < 1) return;
    const limit = items[idx].product.quantityLimit;
    if (limit && qty > limit) return;
    setItems((prev) => { const copy = [...prev]; copy[idx].quantity = qty; return copy; });
  };

  const setVariant = (idx: number, variantId: string, variantName: string) => {
    setItems((prev) => { const copy = [...prev]; copy[idx].variantId = variantId; copy[idx].variantName = variantName; return copy; });
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalEstimate = items.reduce((acc, item) => {
    const unit = item.pricing?.estimatedTotal || 0;
    return acc + unit * item.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { setError("Keranjang kosong."); return; }
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.deliveryAddress.trim()) {
      setError("Harap isi semua field yang diperlukan."); return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          deliveryNotes: form.deliveryNotes,
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variantId,
            variantName: item.variantName,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan.");
      setSubmitted(true);
      setSubmittedOrderId(data.id);
      setSubmittedOrderNumber(data.orderNumber);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-emerald-200 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Pesanan Diterima!</h1>
            <p className="text-slate-500 text-sm">Nomor pesanan Anda:</p>
            <p className="text-2xl font-black text-indigo-700 font-mono">{submittedOrderNumber}</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Admin kami akan mereview pesanan Anda dan mengirimkan instruksi pembayaran. Silakan cek riwayat pesanan untuk update terbaru.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/orders/${submittedOrderId}`} className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors">
              Lihat Detail Pesanan
            </Link>
            <Link href="/orders" className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-indigo-300 transition-colors">
              Riwayat Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700">{error}</h2>
          <Link href="/trips" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm">
            <ArrowRight className="w-4 h-4" />
            Lihat Semua Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Checkout</h1>
        {trip && (
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-500" />
            {trip.title} — {trip.destinationCity}, {trip.destinationCountry}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Items */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              Item Pesanan
            </h2>

            {items.length === 0 && (
              <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200">
                <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Keranjang kosong. Pilih produk dari trip terlebih dahulu.</p>
                {trip && (
                  <Link href={`/trips/${tripId}`} className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 font-bold">
                    <ArrowRight className="w-4 h-4" />
                    Lihat Produk Trip
                  </Link>
                )}
              </div>
            )}

            {items.map((item, idx) => {
              const images = (() => { try { return JSON.parse(item.product.images) as string[]; } catch { return []; } })();
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {images[0] ? (
                        <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{item.product.name}</h3>
                      {item.pricing && (
                        <p className="text-lg font-extrabold text-indigo-700 mt-1">{item.pricing.formattedTotal}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">per item</p>
                    </div>
                    <button type="button" onClick={() => removeItem(idx)} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Variant Selection */}
                  {item.product.variants.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-500">Pilih Varian:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.product.variants.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVariant(idx, v.id, v.name)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                              item.variantId === v.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 text-slate-600 hover:border-indigo-300"
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                      {item.product.variants.length > 0 && !item.variantId && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Pilih varian terlebih dahulu
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-slate-500">Jumlah:</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQuantity(idx, item.quantity - 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(idx, item.quantity + 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.product.quantityLimit && (
                      <span className="text-xs text-slate-400">Maks. {item.product.quantityLimit}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900">Informasi Penerima</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nomor HP/WA <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Alamat Pengiriman <span className="text-red-500">*</span></label>
              <textarea
                value={form.deliveryAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all resize-none"
                placeholder="Alamat lengkap termasuk RT/RW, Kelurahan, Kecamatan, Kota"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Pengiriman (opsional)</label>
              <textarea
                value={form.deliveryNotes}
                onChange={(e) => setForm((prev) => ({ ...prev, deliveryNotes: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all resize-none"
                placeholder="Spesifikasi tambahan, patokan lokasi, dll."
              />
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="p-5 rounded-3xl bg-white border-2 border-slate-100 shadow-md space-y-4">
              <h2 className="font-bold text-slate-900">Ringkasan Pesanan</h2>

              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate max-w-[160px]">{item.product.name} ×{item.quantity}</span>
                  <span className="font-bold text-slate-800 flex-shrink-0 ml-2">
                    {item.pricing ? `Rp ${((item.pricing.estimatedTotal * item.quantity) / 1000).toFixed(0)}K` : "-"}
                  </span>
                </div>
              ))}

              <hr className="border-slate-100" />

              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Estimasi Total</span>
                <span className="font-extrabold text-indigo-700 text-lg">
                  {totalEstimate > 0 ? `Rp ${(totalEstimate / 1000000).toFixed(2)}jt` : "-"}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                ⚠️ Total ini merupakan estimasi. Admin akan mengkonfirmasi total akhir beserta instruksi pembayaran.
              </p>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" />Konfirmasi Pesanan</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
