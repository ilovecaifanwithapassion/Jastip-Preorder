"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState("6281234567890");

  useEffect(() => {
    async function loadPhone() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.whatsapp_number) {
            setPhoneNumber(data.whatsapp_number);
          }
        }
      } catch (e) {
        // use default
      }
    }
    loadPhone();
  }, []);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Halo Admin JastipPreorder, saya ingin menanyakan jadwal shopping trip / cara order jastip luar negeri."
  )}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Hubungi CS WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition duration-300 group hover:scale-105 active:scale-95"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 text-white fill-white" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
        </span>
      </div>
      <span className="text-xs font-black tracking-wide pr-1 hidden sm:inline">
        WhatsApp CS
      </span>
    </a>
  );
}
