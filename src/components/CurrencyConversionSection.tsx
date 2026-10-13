"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  RefreshCw,
  ArrowRightLeft,
  DollarSign,
  Sparkles,
  Calculator,
  ShieldCheck,
  Check,
  Info,
  Clock,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  multiplierDisplay: number; // for displaying e.g. 100 JPY or 1000 KRW
}

const FAMOUS_CURRENCIES: CurrencyInfo[] = [
  { code: "SGD", name: "Dolar Singapura", symbol: "S$", flag: "🇸🇬", multiplierDisplay: 1 },
  { code: "JPY", name: "Yen Jepang", symbol: "¥", flag: "🇯🇵", multiplierDisplay: 100 },
  { code: "KRW", name: "Won Korea Selatan", symbol: "₩", flag: "🇰🇷", multiplierDisplay: 1000 },
  { code: "HKD", name: "Dolar Hong Kong", symbol: "HK$", flag: "🇭🇰", multiplierDisplay: 1 },
  { code: "USD", name: "Dolar Amerika", symbol: "$", flag: "🇺🇸", multiplierDisplay: 1 },
  { code: "EUR", name: "Euro Uni Eropa", symbol: "€", flag: "🇪🇺", multiplierDisplay: 1 },
  { code: "GBP", name: "Poundsterling Inggris", symbol: "£", flag: "🇬🇧", multiplierDisplay: 1 },
  { code: "THB", name: "Baht Thailand", symbol: "฿", flag: "🇹🇭", multiplierDisplay: 100 },
  { code: "MYR", name: "Ringgit Malaysia", symbol: "RM", flag: "🇲🇾", multiplierDisplay: 1 },
  { code: "AUD", name: "Dolar Australia", symbol: "A$", flag: "🇦🇺", multiplierDisplay: 1 },
];

export function CurrencyConversionSection() {
  const [rates, setRates] = useState<Record<string, number>>({
    SGD: 11950,
    JPY: 104.5,
    KRW: 11.5,
    HKD: 2010,
    USD: 15650,
    EUR: 16900,
    GBP: 19800,
    THB: 450,
    MYR: 3520,
    AUD: 10250,
  });

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Interactive Calculator State
  const [calcAmount, setCalcAmount] = useState<string>("1000");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("JPY");
  const [isReverse, setIsReverse] = useState<boolean>(false); // false: Foreign -> IDR, true: IDR -> Foreign
  const [includeServiceFee, setIncludeServiceFee] = useState<boolean>(true);
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchRates = async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rates?all=true${force ? "&refresh=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setRates((prev) => ({ ...prev, ...data.rates }));
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("Could not fetch latest rates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Compute conversion calculation
  const parsedAmount = parseFloat(calcAmount) || 0;
  const currentRate = rates[selectedCurrency] || 1;

  const calculation = useMemo(() => {
    if (!isReverse) {
      // Foreign Currency -> IDR
      const baseIDR = parsedAmount * currentRate;
      const feeAmount = includeServiceFee ? baseIDR * (serviceFeePercent / 100) : 0;
      const totalIDR = Math.round(baseIDR + feeAmount);
      return {
        base: Math.round(baseIDR),
        fee: Math.round(feeAmount),
        total: totalIDR,
      };
    } else {
      // IDR -> Foreign Currency
      const baseForeign = currentRate > 0 ? parsedAmount / currentRate : 0;
      return {
        base: baseForeign,
        fee: 0,
        total: baseForeign,
      };
    }
  }, [parsedAmount, currentRate, isReverse, includeServiceFee, serviceFeePercent]);

  const handleCopyRate = (curr: CurrencyInfo, rateValue: number) => {
    const text = `1 ${curr.code} = Rp ${rateValue.toLocaleString("id-ID")}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(curr.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedCurrInfo = FAMOUS_CURRENCIES.find((c) => c.code === selectedCurrency) || FAMOUS_CURRENCIES[0];

  return (
    <section id="kurs" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white rounded-3xl" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Currency Hub & Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Kalkulator & Kurs Valas Terkini (Real-Time)
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Pantau pergerakan nilai tukar mata uang terpopuler (SGD, Yen, Won, HKD, USD, EUR) langsung dari data pasar European Central Bank (ECB) untuk estimasi belanja jastip yang 100% transparan.
          </p>
        </div>

        {/* Live Refresh and Meta */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-right text-[11px] leading-tight px-2">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Pasar Valas Aktif
            </p>
            <p className="text-slate-400 mt-0.5">
              Update: {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </p>
          </div>
          <button
            onClick={() => fetchRates(true)}
            disabled={loading}
            title="Refresh kurs live sekarang"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Famous Currency Rate Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10">
        {FAMOUS_CURRENCIES.slice(0, 6).map((curr) => {
          const rateVal = rates[curr.code] || 1;
          const displayRate = Math.round(rateVal * curr.multiplierDisplay);
          const isCopied = copiedCode === curr.code;

          return (
            <div
              key={curr.code}
              onClick={() => {
                setSelectedCurrency(curr.code);
                setIsReverse(false);
              }}
              className={`p-4 rounded-2xl bg-white border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md relative flex flex-col justify-between ${
                selectedCurrency === curr.code
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl" role="img" aria-label={curr.name}>
                    {curr.flag}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                    {curr.code}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 truncate" title={curr.name}>
                  {curr.name}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <p className="text-[10px] text-slate-400 font-medium">
                  {curr.multiplierDisplay === 1
                    ? `1 ${curr.code} ≈`
                    : `${curr.multiplierDisplay.toLocaleString()} ${curr.code} ≈`}
                </p>
                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition">
                  Rp {displayRate.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Quick Select / Click Indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyRate(curr, rateVal);
                  }}
                  title="Salin nilai kurs"
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px]"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Two-Way Currency Converter & Jastip Estimator Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-indigo-950/5 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Interactive Converter Controls (7 Cols) */}
          <div className="p-6 sm:p-8 lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Konversi & Simulasi Biaya Jastip</h3>
                  <p className="text-xs text-slate-500">Hitung nilai belanja luar negeri ke Rupiah secara instan</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReverse(!isReverse)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Balik Arah (Swap)</span>
              </button>
            </div>

            {/* Quick Currency Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pilih Mata Uang Valas:</label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {FAMOUS_CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                      selectedCurrency === curr.code
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{curr.flag}</span>
                    <span>{curr.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Input Converter Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input: From Currency */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {!isReverse ? `Nominal Belanja (${selectedCurrency})` : "Nominal Rupiah (IDR)"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-400">
                    {!isReverse ? selectedCurrInfo.symbol : "Rp"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {!isReverse ? `${selectedCurrInfo.name} (${selectedCurrInfo.flag})` : "Indonesian Rupiah (🇮🇩)"}
                </p>
              </div>

              {/* Output: To Currency */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  {!isReverse ? "Hasil Konversi (IDR)" : `Hasil Valas (${selectedCurrency})`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-indigo-500">
                    {!isReverse ? "Rp" : selectedCurrInfo.symbol}
                  </span>
                  <p className="text-xl font-black text-indigo-900 truncate">
                    {!isReverse
                      ? calculation.base.toLocaleString("id-ID")
                      : calculation.base.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <p className="text-[10px] text-indigo-600 font-medium">
                  Kurs: 1 {selectedCurrency} = Rp {currentRate.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Jastip Fee Toggle & Customizer */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeServiceFee}
                    onChange={(e) => setIncludeServiceFee(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Simulasikan Jasa Titip (+{serviceFeePercent}%)
                  </span>
                </label>
                <div className="flex items-center gap-1">
                  {[7, 10, 15].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      disabled={!includeServiceFee}
                      onClick={() => setServiceFeePercent(fee)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                        serviceFeePercent === fee && includeServiceFee
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      } disabled:opacity-40`}
                    >
                      {fee}%
                    </button>
                  ))}
                </div>
              </div>

              {includeServiceFee && !isReverse && (
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Harga Barang Murni:</span>
                    <p className="font-bold text-slate-800">Rp {calculation.base.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Fee Titip ({serviceFeePercent}%):</span>
                    <p className="font-bold text-indigo-600">+ Rp {calculation.fee.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Card & Action (5 Cols) */}
          <div className="p-6 sm:p-8 lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transparansi Kurs 100%</span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Estimasi Total Bayar:</p>
                <h4 className="text-3xl font-black text-white tracking-tight mt-1">
                  Rp {calculation.total.toLocaleString("id-ID")}
                </h4>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  Untuk pembelanjaan {calcAmount} {selectedCurrency} ({selectedCurrInfo.name})
                </p>
              </div>

              {/* Transparency Bullet Points */}
              <div className="space-y-2 pt-4 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Nilai tukar langsung dari bank sentral resmi (ECB) tanpa mark-up tersembunyi.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Kurs dikunci saat checkout pesanan terbit, aman dari fluktuasi valas.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Struk toko fisik resmi luar negeri disertakan dalam pengiriman.</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-4">
              <Link
                href={`/products?search=${encodeURIComponent(selectedCurrInfo.name)}`}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                Lihat Produk Asal {selectedCurrInfo.name}
              </Link>
              <Link
                href={`/custom-request?currency=${selectedCurrency}`}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 transition"
              >
                <span>Titip Barang Khusus {selectedCurrency}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
