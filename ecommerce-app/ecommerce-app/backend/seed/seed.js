require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Product = require("../src/models/Product");
const Cart = require("../src/models/Cart");
const Order = require("../src/models/Order");
const Review = require("../src/models/Review");

async function seed() {
  await connectDB();

  console.log("[seed] Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log("[seed] Creating users...");
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);

  const admin = await User.create({
    name: "Store Admin",
    email: "admin@example.com",
    passwordHash: adminPasswordHash,
    role: "admin",
    consent: { given: true, timestamp: new Date() },
  });

  const customer = await User.create({
    name: "Jane Shopper",
    email: "customer@example.com",
    passwordHash: customerPasswordHash,
    role: "customer",
    addresses: [
      { label: "Home", street: "12 Market Rd", city: "Yola", state: "Adamawa", zip: "640001", country: "Nigeria", isDefault: true },
    ],
    consent: { given: true, timestamp: new Date() },
  });

  console.log("[seed] Creating products...");
  const products = await Product.insertMany([
    {
      name: "Classic Crew T-Shirt",
      description: "A soft, breathable cotton crew-neck t-shirt for everyday wear.",
      brand: "Northfield",
      category: "Men",
      basePrice: 19.99,
      images: ["https://picsum.photos/seed/tshirt1/500/600"],
      variants: [
        { size: "S", color: "Black", sku: "TS-BLK-S", stock: 12 },
        { size: "M", color: "Black", sku: "TS-BLK-M", stock: 20 },
        { size: "L", color: "Black", sku: "TS-BLK-L", stock: 4 },
        { size: "M", color: "White", sku: "TS-WHT-M", stock: 0 },
      ],
    },
    {
      name: "Everyday Denim Jacket",
      description: "A versatile mid-wash denim jacket that layers over anything.",
      brand: "Northfield",
      category: "Men",
      basePrice: 64.5,
      images: ["https://picsum.photos/seed/denimjacket/500/600"],
      variants: [
        { size: "M", color: "Blue", sku: "DJ-BLU-M", stock: 8 },
        { size: "L", color: "Blue", sku: "DJ-BLU-L", stock: 3 },
      ],
    },
    {
      name: "Floral Wrap Dress",
      description: "A flowing wrap dress with a floral print, perfect for warm days.",
      brand: "Marielle",
      category: "Women",
      basePrice: 48.0,
      images: ["https://picsum.photos/seed/wrapdress/500/600"],
      variants: [
        { size: "S", color: "Floral Pink", sku: "WD-PNK-S", stock: 6 },
        { size: "M", color: "Floral Pink", sku: "WD-PNK-M", stock: 10 },
        { size: "L", color: "Floral Pink", sku: "WD-PNK-L", stock: 2 },
      ],
    },
    {
      name: "High-Waist Skinny Jeans",
      description: "Stretch-fit skinny jeans with a flattering high-waist cut.",
      brand: "Marielle",
      category: "Women",
      basePrice: 39.99,
      images: ["https://picsum.photos/seed/skinnyjeans/500/600"],
      variants: [
        { size: "S", color: "Dark Wash", sku: "JN-DRK-S", stock: 15 },
        { size: "M", color: "Dark Wash", sku: "JN-DRK-M", stock: 15 },
        { size: "M", color: "Light Wash", sku: "JN-LGT-M", stock: 5 },
      ],
    },
    {
      name: "Canvas Low-Top Sneakers",
      description: "Lightweight canvas sneakers with a rubber sole for all-day comfort.",
      brand: "Trailmark",
      category: "Shoes",
      basePrice: 34.99,
      images: ["https://picsum.photos/seed/sneakers1/500/600"],
      variants: [
        { size: "40", color: "White", sku: "SN-WHT-40", stock: 9 },
        { size: "41", color: "White", sku: "SN-WHT-41", stock: 7 },
        { size: "42", color: "Black", sku: "SN-BLK-42", stock: 0 },
      ],
    },
    {
      name: "Kids Rainbow Hoodie",
      description: "A cozy fleece hoodie with a playful rainbow print for kids.",
      brand: "Little Northfield",
      category: "Kids",
      basePrice: 24.99,
      images: ["https://picsum.photos/seed/kidshoodie/500/600"],
      variants: [
        { size: "4-5Y", color: "Multicolor", sku: "KH-MLT-45", stock: 10 },
        { size: "6-7Y", color: "Multicolor", sku: "KH-MLT-67", stock: 6 },
      ],
    },
  ]);

  console.log("[seed] Creating a sample delivered order for the demo customer...");
  const jacket = products[1];
  const jacketVariant = jacket.variants[0];

  const sampleOrder = await Order.create({
    user: customer._id,
    items: [
      {
        product: jacket._id,
        variantId: jacketVariant._id,
        name: jacket.name,
        size: jacketVariant.size,
        color: jacketVariant.color,
        image: jacket.images[0],
        price: jacket.basePrice,
        quantity: 1,
      },
    ],
    shippingAddress: { street: "12 Market Rd", city: "Yola", state: "Adamawa", zip: "640001", country: "Nigeria" },
    status: "delivered",
    paymentStatus: "paid",
    paymentReference: "MOCK-SEED-0001",
    subtotal: jacket.basePrice,
    tax: Number((jacket.basePrice * 0.08).toFixed(2)),
    shipping: 5.99,
    total: Number((jacket.basePrice * 1.08 + 5.99).toFixed(2)),
    statusHistory: [
      { status: "pending", timestamp: new Date(Date.now() - 5 * 86400000) },
      { status: "confirmed", timestamp: new Date(Date.now() - 4 * 86400000) },
      { status: "shipped", timestamp: new Date(Date.now() - 2 * 86400000) },
      { status: "delivered", timestamp: new Date(Date.now() - 1 * 86400000) },
    ],
  });

  await Review.create({
    product: jacket._id,
    user: customer._id,
    rating: 5,
    comment: "Great fit and the denim feels durable. Runs slightly large, sized down would be perfect.",
    verifiedPurchase: true,
  });
  await Product.findByIdAndUpdate(jacket._id, { avgRating: 5, reviewCount: 1 });

  console.log("\n[seed] Done! Demo accounts:");
  console.log("  Admin:    admin@example.com / Admin123!");
  console.log("  Customer: customer@example.com / Customer123!");
  console.log(`  Seeded ${products.length} products and 1 sample delivered order with a review.\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
