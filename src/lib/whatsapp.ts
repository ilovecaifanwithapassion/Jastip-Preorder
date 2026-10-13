/**
 * Generates safely URL-encoded WhatsApp click-to-chat links
 */

export function getWhatsAppSupportUrl(params: {
  phone?: string;
  type?: "GENERAL" | "TRIP_INQUIRY" | "ORDER_STATUS" | "CUSTOM_REQUEST" | "PAYMENT_PROOF";
  orderNumber?: string;
  tripTitle?: string;
  productName?: string;
  customerName?: string;
}): string {
  const rawPhone = params.phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890";
  // Clean phone number: remove +, -, spaces
  const cleanPhone = rawPhone.replace(/\D/g, "");

  let message = "";

  switch (params.type) {
    case "TRIP_INQUIRY":
      message = `Halo Admin Jastip, saya tertarik dengan shopping trip "${params.tripTitle || "Trip"}". Apakah masih bisa titip belanja?`;
      break;

    case "ORDER_STATUS":
      message = `Halo Admin Jastip, saya ingin menanyakan update order #${params.orderNumber || ""}. Terima kasih!`;
      break;

    case "CUSTOM_REQUEST":
      message = `Halo Admin Jastip, saya ingin mengajukan custom request titip barang "${params.productName || ""}" untuk trip "${params.tripTitle || ""}".`;
      break;

    case "PAYMENT_PROOF":
      message = `Halo Admin Jastip, saya telah melakukan transfer pembayaran untuk Order #${params.orderNumber || ""}. Mohon bantuan verifikasinya.`;
      break;

    case "GENERAL":
    default:
      message = `Halo Admin Jastip Preorder, saya ingin bertanya seputar layanan jastip.`;
      break;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
