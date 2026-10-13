import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Business Owner Admin
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "sidneyganteng@jastip.com";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "ilovesgwithapassion";
  const adminName = process.env.INITIAL_ADMIN_NAME || "sidneyganteng";

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { name: adminName },
      ],
    },
  });

  let adminUser = existingAdmin;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: adminName,
        phone: "+6281234567890",
        role: "ADMIN",
      },
    });
    console.log(`✅ Created Admin user: ${adminName} (${adminEmail})`);
  } else {
    // Ensure password is updated
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: adminName,
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`ℹ️ Updated Admin user: ${adminName}`);
  }

  // 3. System Settings
  const settings = [
    {
      key: "whatsapp_number",
      value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890",
      description: "Business WhatsApp number for customer inquiries",
    },
    {
      key: "default_customer_currency",
      value: process.env.DEFAULT_CUSTOMER_CURRENCY || "IDR",
      description: "Default customer checkout and display currency",
    },
    {
      key: "payment_instructions",
      value: "Bank Central Asia (BCA)\nAccount Number: 8830-1234-5678\nAccount Holder: PT Jastip Preorder Nusantara\n\nPlease include your Order Number in the transfer notes.",
      description: "Bank transfer payment instructions displayed to customers",
    },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log("✅ Seeded system settings");

  // 4. Seed Demonstration Trips
  const existingTrips = await prisma.trip.count();
  if (existingTrips === 0) {
    const today = new Date();
    
    // Trip 1: Singapore Express (OPEN FOR ORDERS)
    const sgTrip = await prisma.trip.create({
      data: {
        title: "Singapore Orchard & Jewel Exclusive Shopping",
        destinationCountry: "Singapore",
        destinationCity: "Singapore",
        originCity: "Jakarta",
        departureDate: new Date(today.getTime() + 10 * 86400000), // +10 days
        returnDate: new Date(today.getTime() + 14 * 86400000),    // +14 days
        orderOpenDate: new Date(today.getTime() - 2 * 86400000),  // -2 days
        orderDeadline: new Date(today.getTime() + 8 * 86400000),  // +8 days
        estimatedDeliveryDate: new Date(today.getTime() + 16 * 86400000),
        status: "OPEN",
        description: "Personal shopping trip to Singapore! Accepting orders for luxury goods, Charles & Keith, Bacha Coffee, Bengawan Solo, and Takashimaya exclusives. Hand-carried with care.",
        coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
        purchaseCurrency: "SGD",
        exchangeRateMode: "AUTO_LIVE",
        serviceFeePercent: 12.0,
        flatServiceFee: 15000,
        termsAndNotes: "All items inspected before purchase. Full refund if item is out of stock in official retail stores.",
        products: {
          create: [
            {
              name: "Bacha Coffee - Seville Orange 1910 Gift Box (12 Bags)",
              description: "Signature Arabica coffee infused with cracked cocoa beans and ripe orange notes. Official Bacha boutique packaging with ribbon.",
              category: "Food & Beverage",
              brand: "Bacha Coffee",
              sourceStore: "Bacha Coffee ION Orchard",
              originalPrice: 32.0, // SGD
              originalCurrency: "SGD",
              quantityLimit: 20,
              availabilityStatus: "AVAILABLE",
              images: JSON.stringify([
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80"
              ]),
              variants: {
                create: [
                  { name: "Ground Coffee (12 Drip Bags)", priceAdjustment: 0 },
                  { name: "Whole Beans Tin (250g)", priceAdjustment: 6.0 },
                ],
              },
            },
            {
              name: "Charles & Keith - Metallic Push-Lock Top Handle Bag",
              description: "A timeless modern silhouette with textured finish and elegant metallic push-lock hardware. Includes detachable strap.",
              category: "Fashion & Bags",
              brand: "Charles & Keith",
              sourceStore: "Charles & Keith Jewel Changi",
              originalPrice: 85.0, // SGD
              originalCurrency: "SGD",
              quantityLimit: 10,
              availabilityStatus: "AVAILABLE",
              images: JSON.stringify([
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"
              ]),
              variants: {
                create: [
                  { name: "Color: Noir Black", priceAdjustment: 0 },
                  { name: "Color: Cream Ivory", priceAdjustment: 0 },
                  { name: "Color: Sage Green", priceAdjustment: 0 },
                ],
              },
            },
            {
              name: "Bengawan Solo - Fresh Pandan Chiffon Cake (Standard Box)",
              description: "Air-flown same-day freshly baked Singaporean pandan chiffon cake with authentic aroma and ultra-fluffy texture.",
              category: "Food & Bakery",
              brand: "Bengawan Solo",
              sourceStore: "Bengawan Solo Changi Terminal 3",
              originalPrice: 18.0, // SGD
              originalCurrency: "SGD",
              quantityLimit: 15,
              availabilityStatus: "LIMITED",
              images: JSON.stringify([
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80"
              ]),
            },
          ],
        },
      },
    });
    console.log(`✅ Seeded Trip 1: ${sgTrip.title}`);

    // Trip 2: Tokyo Japan Autumn Shopping (OPEN FOR ORDERS)
    const jpHunt = await prisma.trip.create({
      data: {
        title: "Tokyo Shinjuku & Akihabara Autumn Hunting",
        destinationCountry: "Japan",
        destinationCity: "Tokyo",
        originCity: "Jakarta",
        departureDate: new Date(today.getTime() + 20 * 86400000),
        returnDate: new Date(today.getTime() + 27 * 86400000),
        orderOpenDate: new Date(today.getTime() - 1 * 86400000),
        orderDeadline: new Date(today.getTime() + 18 * 86400000),
        estimatedDeliveryDate: new Date(today.getTime() + 29 * 86400000),
        status: "OPEN",
        description: "Shopping trip covering Don Quijote, Pokemon Center Mega Tokyo, Ginza department stores, and pharmacy cosmetics.",
        coverImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80",
        purchaseCurrency: "JPY",
        exchangeRateMode: "AUTO_LIVE",
        serviceFeePercent: 10.0,
        flatServiceFee: 25000,
        termsAndNotes: "Fragile items packed with bubble wrap. Official receipts provided upon request.",
        products: {
          create: [
            {
              name: "Shiseido Fino Premium Touch Hair Mask (230g)",
              description: "Japan's best-selling rinse-off hair treatment formulated with royal jelly EX, PCA, and lipidure to repair damaged hair.",
              category: "Skincare & Beauty",
              brand: "Shiseido",
              sourceStore: "Matsumoto Kiyoshi Shinjuku",
              originalPrice: 1080.0, // JPY
              originalCurrency: "JPY",
              quantityLimit: 30,
              availabilityStatus: "AVAILABLE",
              images: JSON.stringify([
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
              ]),
            },
            {
              name: "Pokemon Center - Pikachu Japanese Kimono Plush (Exclusive)",
              description: "Authentic Pokemon Center limited edition plush featuring Pikachu dressed in traditional Kyoto kimono attire.",
              category: "Collectibles & Toys",
              brand: "Pokemon Center",
              sourceStore: "Pokemon Center Mega Tokyo Sunshine City",
              originalPrice: 2800.0, // JPY
              originalCurrency: "JPY",
              quantityLimit: 8,
              availabilityStatus: "LIMITED",
              images: JSON.stringify([
                "https://images.unsplash.com/photo-1613778307462-8f92f2545a49?w=800&q=80"
              ]),
            },
          ],
        },
      },
    });
    console.log(`✅ Seeded Trip 2: ${jpHunt.title}`);

    // Trip 3: Seoul K-Beauty (DRAFT - Not publicly visible)
    await prisma.trip.create({
      data: {
        title: "Seoul Hongdae & Myeongdong K-Beauty Trip",
        destinationCountry: "South Korea",
        destinationCity: "Seoul",
        originCity: "Jakarta",
        departureDate: new Date(today.getTime() + 40 * 86400000),
        returnDate: new Date(today.getTime() + 45 * 86400000),
        orderOpenDate: new Date(today.getTime() + 25 * 86400000),
        orderDeadline: new Date(today.getTime() + 38 * 86400000),
        estimatedDeliveryDate: new Date(today.getTime() + 47 * 86400000),
        status: "DRAFT", // DRAFT: Must verify that customers CANNOT see this
        description: "Draft itinerary for Olive Young skincare hunting and Gentle Monster sunglasses.",
        coverImage: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80",
        purchaseCurrency: "USD",
        exchangeRateMode: "AUTO_LIVE",
        serviceFeePercent: 12.0,
      },
    });
    console.log(`✅ Seeded Trip 3 (DRAFT)`);
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
