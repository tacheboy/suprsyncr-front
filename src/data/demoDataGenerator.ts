// src/data/demoDataGenerator.ts
// Generates realistic fake data for demo: ~50 products, ~150 orders, inventory, listings
// All data uses Indian context (INR, Indian names, addresses)

import type {
  Product,
  ProductVariant,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Inventory,
  Platform,
  PlatformType,
  OrderStatistics,
} from '@/types';
import type { Listing, ListingStatus } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

function randomDate(daysBack: number): string {
  const d = rand(0, daysBack);
  const h = rand(0, 23);
  const m = rand(0, 59);
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, m, rand(0, 59), 0);
  return date.toISOString();
}

// ─── Platform-to-key mapping ────────────────────────────────────────────────

const ALL_PLATFORM_TYPES: PlatformType[] = [
  'AMAZON', 'SHOPIFY', 'FLIPKART', 'MEESHO', 'BLINKIT', 'WOOCOMMERCE',
];

// Map onboarding platform id → PlatformType
export const PLATFORM_ID_TO_TYPE: Record<string, PlatformType> = {
  amazon: 'AMAZON',
  flipkart: 'FLIPKART',
  meesho: 'MEESHO',
  shopify: 'SHOPIFY',
  woocommerce: 'WOOCOMMERCE',
  blinkit: 'BLINKIT',
};

// Nicer display names used in onboarding (id → label)
export const PLATFORM_ID_TO_LABEL: Record<string, string> = {
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  meesho: 'Meesho',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  blinkit: 'Blinkit',
};

// ─── Indian name pool ───────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Amit', 'Ananya', 'Arjun', 'Deepika', 'Diya', 'Gaurav',
  'Ishaan', 'Kavya', 'Kiran', 'Lakshmi', 'Manish', 'Meera', 'Neha', 'Nitin',
  'Pooja', 'Priya', 'Rahul', 'Rajesh', 'Riya', 'Rohit', 'Sakshi', 'Sanjay',
  'Shreya', 'Sneha', 'Suresh', 'Tanvi', 'Varun', 'Vikram', 'Vivek', 'Zara',
];

const LAST_NAMES = [
  'Agarwal', 'Banerjee', 'Choudhury', 'Das', 'Deshpande', 'Gupta', 'Iyer',
  'Jain', 'Joshi', 'Kumar', 'Mehta', 'Menon', 'Mishra', 'Nair', 'Patel',
  'Rao', 'Reddy', 'Shah', 'Sharma', 'Singh', 'Srinivasan', 'Tiwari', 'Verma',
];

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', pin: '400' },
  { city: 'Delhi', state: 'Delhi', pin: '110' },
  { city: 'Bangalore', state: 'Karnataka', pin: '560' },
  { city: 'Hyderabad', state: 'Telangana', pin: '500' },
  { city: 'Chennai', state: 'Tamil Nadu', pin: '600' },
  { city: 'Kolkata', state: 'West Bengal', pin: '700' },
  { city: 'Pune', state: 'Maharashtra', pin: '411' },
  { city: 'Ahmedabad', state: 'Gujarat', pin: '380' },
  { city: 'Jaipur', state: 'Rajasthan', pin: '302' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pin: '226' },
  { city: 'Kochi', state: 'Kerala', pin: '682' },
  { city: 'Chandigarh', state: 'Punjab', pin: '160' },
];

const STREETS = [
  'MG Road', 'Station Road', 'Gandhi Nagar', 'Nehru Colony', 'Civil Lines',
  'Sector 15', 'Ring Road', 'Banjara Hills', 'Koramangala', 'Andheri West',
  'Park Street', 'Connaught Place', 'Indiranagar', 'Whitefield', 'Salt Lake',
];

const COURIERS = ['Delhivery', 'BlueDart', 'DTDC', 'Ecom Express', 'Shadowfax', 'XpressBees'];

function randomName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function randomEmail(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '.')}${rand(1, 99)}@gmail.com`;
}

function randomPhone(): string {
  return `+91 ${rand(70, 99)}${rand(100, 999)}${rand(10000, 99999)}`;
}

function randomAddress() {
  const loc = pick(CITIES);
  return {
    line1: `${rand(1, 999)}, ${pick(STREETS)}`,
    city: loc.city,
    state: loc.state,
    pincode: `${loc.pin}${String(rand(1, 99)).padStart(3, '0')}`,
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────

const CATEGORY_DEFS = [
  { id: 1, name: 'Electronics', parentId: null },
  { id: 2, name: 'Fashion', parentId: null },
  { id: 3, name: 'Home & Kitchen', parentId: null },
  { id: 4, name: 'Beauty & Personal Care', parentId: null },
  { id: 5, name: 'Grocery & Gourmet', parentId: null },
  { id: 6, name: 'Sports & Outdoors', parentId: null },
];

// ─── Product Catalog ────────────────────────────────────────────────────────

interface ProductSeed {
  name: string;
  brand: string;
  category: number;    // category id
  sku: string;
  basePrice: number;
  description: string;
  platforms: PlatformType[];  // which platforms this product is sold on
  variants: Array<{
    name: string;
    sku: string;
    price: number;
    attributes: Record<string, string>;
  }>;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  // === Electronics (cat 1) ===
  { name: 'BoAt Rockerz 450 Wireless Headphones', brand: 'boAt', category: 1, sku: 'ELEC-BT-RKZ450', basePrice: 1499, description: 'Bluetooth over-ear headphones with 15h battery, 40mm drivers and padded ear cushions. Ideal for music and calls.', platforms: ['AMAZON', 'FLIPKART', 'MEESHO'], variants: [{ name: 'Black', sku: 'ELEC-BT-RKZ450-BLK', price: 1499, attributes: { color: 'Black' } }, { name: 'Navy Blue', sku: 'ELEC-BT-RKZ450-BLU', price: 1499, attributes: { color: 'Navy Blue' } }] },
  { name: 'Mi 20000 mAh Power Bank 3i', brand: 'Xiaomi', category: 1, sku: 'ELEC-PB-MI20K', basePrice: 1399, description: '20000mAh Li-Polymer power bank with 18W fast charging, triple output and Type-C input.', platforms: ['AMAZON', 'FLIPKART'], variants: [{ name: 'Standard', sku: 'ELEC-PB-MI20K-STD', price: 1399, attributes: {} }] },
  { name: 'Noise ColorFit Pro 4 Smartwatch', brand: 'Noise', category: 1, sku: 'ELEC-SW-NCFP4', basePrice: 2999, description: '1.72" AMOLED display, Bluetooth calling, SpO2, heart rate monitoring, 7-day battery.', platforms: ['AMAZON', 'FLIPKART', 'WOOCOMMERCE'], variants: [{ name: 'Jet Black', sku: 'ELEC-SW-NCFP4-JBK', price: 2999, attributes: { color: 'Jet Black' } }, { name: 'Rose Gold', sku: 'ELEC-SW-NCFP4-RGD', price: 3199, attributes: { color: 'Rose Gold' } }] },
  { name: 'Portronics SoundDrum 1 BT Speaker', brand: 'Portronics', category: 1, sku: 'ELEC-SP-PSD1', basePrice: 999, description: '10W portable Bluetooth 5.0 speaker with FM radio, Type-C charging and IPX6 water resistance.', platforms: ['SHOPIFY', 'MEESHO', 'BLINKIT'], variants: [{ name: 'Blue', sku: 'ELEC-SP-PSD1-BLU', price: 999, attributes: { color: 'Blue' } }] },
  { name: 'Ambrane 10000 mAh Wireless Charger Pad', brand: 'Ambrane', category: 1, sku: 'ELEC-WC-AMB10', basePrice: 899, description: 'Qi-certified 10W wireless charging pad with LED indicator, compatible with all Qi phones.', platforms: ['FLIPKART', 'WOOCOMMERCE'], variants: [{ name: 'White', sku: 'ELEC-WC-AMB10-WHT', price: 899, attributes: { color: 'White' } }] },
  { name: 'Fire-Boltt Ninja Call Pro Smartwatch', brand: 'Fire-Boltt', category: 1, sku: 'ELEC-SW-FBNCP', basePrice: 1799, description: '1.69" display, BT calling, 100+ sports modes, IP67 water resistant.', platforms: ['FLIPKART', 'MEESHO'], variants: [{ name: 'Black', sku: 'ELEC-SW-FBNCP-BLK', price: 1799, attributes: { color: 'Black' } }, { name: 'Gold', sku: 'ELEC-SW-FBNCP-GLD', price: 1899, attributes: { color: 'Gold' } }] },
  { name: 'Zebronics Zeb-Thunder BT Earbuds', brand: 'Zebronics', category: 1, sku: 'ELEC-EB-ZBTH', basePrice: 599, description: 'TWS earbuds with ENC, 28h playback, touch controls and splash-proof IPX4.', platforms: ['AMAZON', 'BLINKIT'], variants: [{ name: 'Standard', sku: 'ELEC-EB-ZBTH-STD', price: 599, attributes: {} }] },
  { name: 'Realme USB-C 65W Charger', brand: 'Realme', category: 1, sku: 'ELEC-CH-RM65W', basePrice: 1299, description: 'SuperDart 65W Type-C charger with cable. Compatible with VOOC & SuperDart devices.', platforms: ['AMAZON', 'FLIPKART'], variants: [{ name: 'Standard', sku: 'ELEC-CH-RM65W-STD', price: 1299, attributes: {} }] },

  // === Fashion (cat 2) ===
  { name: 'Cotton Kurti Set - Printed', brand: 'Libas', category: 2, sku: 'FASH-KRT-LBS01', basePrice: 799, description: 'A-line printed cotton kurti with palazzo pants. Comfortable ethnic wear for daily use.', platforms: ['MEESHO', 'FLIPKART', 'AMAZON'], variants: [{ name: 'S', sku: 'FASH-KRT-LBS01-S', price: 799, attributes: { size: 'S' } }, { name: 'M', sku: 'FASH-KRT-LBS01-M', price: 799, attributes: { size: 'M' } }, { name: 'L', sku: 'FASH-KRT-LBS01-L', price: 849, attributes: { size: 'L' } }] },
  { name: 'Men Slim Fit Casual Shirt', brand: 'Dennis Lingo', category: 2, sku: 'FASH-SHT-DL01', basePrice: 599, description: 'Cotton blend slim-fit casual shirt for men. Available in solid colours.', platforms: ['FLIPKART', 'MEESHO'], variants: [{ name: 'Navy M', sku: 'FASH-SHT-DL01-NM', price: 599, attributes: { color: 'Navy', size: 'M' } }, { name: 'White L', sku: 'FASH-SHT-DL01-WL', price: 599, attributes: { color: 'White', size: 'L' } }] },
  { name: 'Handloom Banarasi Silk Saree', brand: 'Satrani', category: 2, sku: 'FASH-SAR-STR01', basePrice: 1299, description: 'Traditional Banarasi silk saree with zari border and rich pallu. Comes with matching blouse piece.', platforms: ['MEESHO', 'SHOPIFY'], variants: [{ name: 'Red', sku: 'FASH-SAR-STR01-RED', price: 1299, attributes: { color: 'Red' } }, { name: 'Royal Blue', sku: 'FASH-SAR-STR01-RBL', price: 1349, attributes: { color: 'Royal Blue' } }] },
  { name: 'Men Running Shoes - Breathable', brand: 'Campus', category: 2, sku: 'FASH-SHO-CMP01', basePrice: 999, description: 'Lightweight mesh running shoes with EVA sole. Perfect for gym, jogging and daily use.', platforms: ['FLIPKART', 'AMAZON', 'WOOCOMMERCE'], variants: [{ name: 'UK 8', sku: 'FASH-SHO-CMP01-8', price: 999, attributes: { size: 'UK 8' } }, { name: 'UK 9', sku: 'FASH-SHO-CMP01-9', price: 999, attributes: { size: 'UK 9' } }, { name: 'UK 10', sku: 'FASH-SHO-CMP01-10', price: 1049, attributes: { size: 'UK 10' } }] },
  { name: 'Women Chikankari Palazzo Set', brand: 'AKS', category: 2, sku: 'FASH-PLZ-AKS01', basePrice: 899, description: 'White Chikankari embroidered short kurti with palazzo. Elegant and breathable for summer.', platforms: ['MEESHO', 'FLIPKART'], variants: [{ name: 'Free Size', sku: 'FASH-PLZ-AKS01-FS', price: 899, attributes: { size: 'Free Size' } }] },
  { name: 'Leather Crossbody Sling Bag', brand: 'Lavie', category: 2, sku: 'FASH-BAG-LVE01', basePrice: 1199, description: 'Vegan leather sling bag with adjustable strap. Multiple compartments for essentials.', platforms: ['AMAZON', 'FLIPKART', 'WOOCOMMERCE'], variants: [{ name: 'Tan', sku: 'FASH-BAG-LVE01-TAN', price: 1199, attributes: { color: 'Tan' } }, { name: 'Black', sku: 'FASH-BAG-LVE01-BLK', price: 1199, attributes: { color: 'Black' } }] },
  { name: 'Ethnic Kundan Jewellery Set', brand: 'Zaveri Pearls', category: 2, sku: 'FASH-JWL-ZVP01', basePrice: 449, description: 'Kundan necklace and earring set. Gold-plated with pearl drop. Ideal for festivals and weddings.', platforms: ['MEESHO', 'SHOPIFY'], variants: [{ name: 'Standard', sku: 'FASH-JWL-ZVP01-STD', price: 449, attributes: {} }] },

  // === Home & Kitchen (cat 3) ===
  { name: 'Prestige Induction Cooktop 1600W', brand: 'Prestige', category: 3, sku: 'HOME-IC-PRG16', basePrice: 2199, description: 'Touch panel induction cooktop with auto-off, feather-touch buttons and anti-magnetic wall.', platforms: ['AMAZON', 'FLIPKART', 'BLINKIT'], variants: [{ name: 'Standard', sku: 'HOME-IC-PRG16-STD', price: 2199, attributes: {} }] },
  { name: 'Milton Thermosteel Flask 1L', brand: 'Milton', category: 3, sku: 'HOME-FL-MLT1L', basePrice: 649, description: '24-hour hot & cold vacuum insulated stainless steel flask. Leak-proof lid.', platforms: ['AMAZON', 'FLIPKART', 'BLINKIT', 'WOOCOMMERCE'], variants: [{ name: 'Silver', sku: 'HOME-FL-MLT1L-SLV', price: 649, attributes: { color: 'Silver' } }, { name: 'Blue', sku: 'HOME-FL-MLT1L-BLU', price: 699, attributes: { color: 'Blue' } }] },
  { name: 'Pigeon Non-Stick Tawa 28cm', brand: 'Pigeon', category: 3, sku: 'HOME-TW-PGN28', basePrice: 399, description: 'Aluminium non-stick flat tawa for dosa and roti. 3-layer non-stick coating.', platforms: ['BLINKIT', 'FLIPKART'], variants: [{ name: 'Standard', sku: 'HOME-TW-PGN28-STD', price: 399, attributes: {} }] },
  { name: 'Kuber Industries Cotton Bedsheet Set', brand: 'Kuber', category: 3, sku: 'HOME-BD-KBR01', basePrice: 549, description: 'Double bedsheet with 2 pillow covers. 144 TC pure cotton, Jaipuri block print.', platforms: ['MEESHO', 'AMAZON', 'FLIPKART'], variants: [{ name: 'Floral Blue', sku: 'HOME-BD-KBR01-FBL', price: 549, attributes: { pattern: 'Floral Blue' } }, { name: 'Paisley Red', sku: 'HOME-BD-KBR01-PRD', price: 549, attributes: { pattern: 'Paisley Red' } }] },
  { name: 'Cello Opalware Dinner Set 27pc', brand: 'Cello', category: 3, sku: 'HOME-DS-CLO27', basePrice: 1799, description: 'Microwave-safe opalware dinner set. 6 plates, 6 bowls, 6 quarter plates, 6 veg bowls, 2 serving bowls, 1 platter.', platforms: ['AMAZON', 'FLIPKART'], variants: [{ name: 'White Lily', sku: 'HOME-DS-CLO27-WL', price: 1799, attributes: { pattern: 'White Lily' } }] },
  { name: 'Solimo Plastic Storage Containers Set of 6', brand: 'Solimo', category: 3, sku: 'HOME-SC-SOL6', basePrice: 349, description: 'BPA-free airtight containers for kitchen storage. Stackable, transparent design.', platforms: ['SHOPIFY', 'BLINKIT', 'WOOCOMMERCE'], variants: [{ name: 'Standard', sku: 'HOME-SC-SOL6-STD', price: 349, attributes: {} }] },
  { name: 'Philips Air Purifier AC1215', brand: 'Philips', category: 3, sku: 'HOME-AP-PHL12', basePrice: 8999, description: 'VitaShield IPS technology removes 99.97% allergens. HEPA filter, auto mode, sleep mode.', platforms: ['AMAZON', 'FLIPKART'], variants: [{ name: 'White', sku: 'HOME-AP-PHL12-WHT', price: 8999, attributes: { color: 'White' } }] },
  { name: 'Bamboo Chopping Board Set', brand: 'Royalford', category: 3, sku: 'HOME-CB-RFL01', basePrice: 499, description: 'Set of 3 natural bamboo cutting boards. Anti-bacterial, eco-friendly, juice groove design.', platforms: ['BLINKIT', 'WOOCOMMERCE', 'SHOPIFY'], variants: [{ name: 'Standard', sku: 'HOME-CB-RFL01-STD', price: 499, attributes: {} }] },

  // === Beauty & Personal Care (cat 4) ===
  { name: 'Mamaearth Vitamin C Face Wash', brand: 'Mamaearth', category: 4, sku: 'BEAU-FW-MEC01', basePrice: 349, description: 'Vitamin C & turmeric face wash for skin illumination. Sulphate-free, toxin-free.', platforms: ['AMAZON', 'BLINKIT', 'FLIPKART', 'MEESHO'], variants: [{ name: '100ml', sku: 'BEAU-FW-MEC01-100', price: 349, attributes: { size: '100ml' } }, { name: '150ml', sku: 'BEAU-FW-MEC01-150', price: 449, attributes: { size: '150ml' } }] },
  { name: 'Plum Green Tea Pore Cleansing Face Wash', brand: 'Plum', category: 4, sku: 'BEAU-FW-PLM01', basePrice: 345, description: 'For oily and acne-prone skin. Contains green tea, glycolic acid. 100% vegan.', platforms: ['AMAZON', 'FLIPKART'], variants: [{ name: '75ml', sku: 'BEAU-FW-PLM01-75', price: 250, attributes: { size: '75ml' } }, { name: '120ml', sku: 'BEAU-FW-PLM01-120', price: 345, attributes: { size: '120ml' } }] },
  { name: 'WOW Onion Shampoo + Conditioner Combo', brand: 'WOW', category: 4, sku: 'BEAU-HC-WOW01', basePrice: 699, description: 'Red onion black seed oil shampoo and conditioner. Reduces hair fall, promotes growth.', platforms: ['AMAZON', 'FLIPKART', 'WOOCOMMERCE', 'MEESHO'], variants: [{ name: 'Combo Pack', sku: 'BEAU-HC-WOW01-CMB', price: 699, attributes: {} }] },
  { name: 'mCaffeine Latte Body Scrub', brand: 'mCaffeine', category: 4, sku: 'BEAU-BS-MCF01', basePrice: 449, description: 'Coffee body scrub with walnut. Exfoliates dead skin, reduces tan, smooth texture.', platforms: ['MEESHO', 'SHOPIFY', 'BLINKIT'], variants: [{ name: '100g', sku: 'BEAU-BS-MCF01-100', price: 449, attributes: { size: '100g' } }] },
  { name: 'Nivea Soft Moisturizing Cream 300ml', brand: 'Nivea', category: 4, sku: 'BEAU-MC-NIV300', basePrice: 299, description: 'Light moisturizing cream with Vitamin E and jojoba oil. For face, hands and body.', platforms: ['BLINKIT', 'FLIPKART', 'AMAZON'], variants: [{ name: '300ml', sku: 'BEAU-MC-NIV300-STD', price: 299, attributes: { size: '300ml' } }] },
  { name: 'Biotique Bio Fruit Whitening Face Pack', brand: 'Biotique', category: 4, sku: 'BEAU-FP-BIO01', basePrice: 199, description: 'Fruit extract face pack for skin brightening and tan removal. 100% botanical extracts.', platforms: ['MEESHO', 'WOOCOMMERCE'], variants: [{ name: '75g', sku: 'BEAU-FP-BIO01-75', price: 199, attributes: { size: '75g' } }] },

  // === Grocery & Gourmet (cat 5) ===
  { name: 'Organic Tattva Toor Dal 1kg', brand: 'Organic Tattva', category: 5, sku: 'GROC-DL-OTT1K', basePrice: 179, description: '100% organic toor dal (arhar). Rich in protein, no pesticides, USDA certified.', platforms: ['BLINKIT', 'AMAZON', 'FLIPKART'], variants: [{ name: '1kg', sku: 'GROC-DL-OTT1K-STD', price: 179, attributes: { weight: '1kg' } }] },
  { name: 'Himalayan Pink Salt 1kg', brand: 'Urban Platter', category: 5, sku: 'GROC-SL-UPH1K', basePrice: 249, description: 'Fine grain Himalayan pink rock salt. Rich in minerals, no additives.', platforms: ['BLINKIT', 'SHOPIFY', 'WOOCOMMERCE'], variants: [{ name: '1kg', sku: 'GROC-SL-UPH1K-STD', price: 249, attributes: { weight: '1kg' } }] },
  { name: 'True Elements Muesli Fruit and Nut 1kg', brand: 'True Elements', category: 5, sku: 'GROC-MS-TEM1K', basePrice: 499, description: 'Healthy breakfast muesli with almonds, cashews, raisins, cranberries. High fibre, low sugar.', platforms: ['AMAZON', 'FLIPKART', 'BLINKIT'], variants: [{ name: '1kg', sku: 'GROC-MS-TEM1K-STD', price: 499, attributes: { weight: '1kg' } }] },
  { name: 'Saffola Gold Refined Oil 5L', brand: 'Saffola', category: 5, sku: 'GROC-OL-SFG5L', basePrice: 799, description: 'Blend of rice bran and sunflower oil. Heart-healthy with oryzanol. FSSAI approved.', platforms: ['BLINKIT', 'FLIPKART'], variants: [{ name: '5L', sku: 'GROC-OL-SFG5L-STD', price: 799, attributes: { weight: '5L' } }] },
  { name: 'Organic India Tulsi Green Tea 25 bags', brand: 'Organic India', category: 5, sku: 'GROC-TEA-OI25', basePrice: 175, description: 'Tulsi and green tea blend for immunity boosting. Caffeine-light, refreshing taste.', platforms: ['SHOPIFY', 'BLINKIT', 'MEESHO'], variants: [{ name: '25 bags', sku: 'GROC-TEA-OI25-STD', price: 175, attributes: {} }] },
  { name: 'Dabur Honey 1kg', brand: 'Dabur', category: 5, sku: 'GROC-HN-DBR1K', basePrice: 349, description: '100% pure honey, no sugar adulteration. NMR tested for purity.', platforms: ['BLINKIT', 'AMAZON', 'FLIPKART', 'WOOCOMMERCE'], variants: [{ name: '1kg', sku: 'GROC-HN-DBR1K-STD', price: 349, attributes: { weight: '1kg' } }, { name: '500g', sku: 'GROC-HN-DBR500-STD', price: 199, attributes: { weight: '500g' } }] },
  { name: 'Aashirvaad Whole Wheat Atta 10kg', brand: 'Aashirvaad', category: 5, sku: 'GROC-AT-ASH10', basePrice: 449, description: '100% whole wheat flour. Soft rotis every time. No maida, no additives.', platforms: ['BLINKIT', 'FLIPKART'], variants: [{ name: '10kg', sku: 'GROC-AT-ASH10-STD', price: 449, attributes: { weight: '10kg' } }] },

  // === Sports & Outdoors (cat 6) ===
  { name: 'Strauss Yoga Mat 6mm TPE', brand: 'Strauss', category: 6, sku: 'SPRT-YM-STR6', basePrice: 699, description: 'Anti-slip TPE yoga mat. 6mm thickness, eco-friendly, with carry strap. 183cm x 61cm.', platforms: ['AMAZON', 'FLIPKART', 'MEESHO'], variants: [{ name: 'Purple', sku: 'SPRT-YM-STR6-PUR', price: 699, attributes: { color: 'Purple' } }, { name: 'Blue', sku: 'SPRT-YM-STR6-BLU', price: 699, attributes: { color: 'Blue' } }] },
  { name: 'Boldfit Resistance Band Set', brand: 'Boldfit', category: 6, sku: 'SPRT-RB-BLD01', basePrice: 449, description: 'Set of 5 latex resistance bands (5 to 40 lbs). With carry bag and exercise guide.', platforms: ['AMAZON', 'FLIPKART'], variants: [{ name: 'Set of 5', sku: 'SPRT-RB-BLD01-S5', price: 449, attributes: {} }] },
  { name: 'Nivia Storm Football Size 5', brand: 'Nivia', category: 6, sku: 'SPRT-FB-NIV5', basePrice: 549, description: 'Machine stitched PU football. Official size 5. Durable for grass and turf surfaces.', platforms: ['FLIPKART', 'AMAZON', 'WOOCOMMERCE'], variants: [{ name: 'Standard', sku: 'SPRT-FB-NIV5-STD', price: 549, attributes: {} }] },
  { name: 'Fastrack Reflex 3.0 Fitness Band', brand: 'Fastrack', category: 6, sku: 'SPRT-FB-FTR30', basePrice: 1495, description: 'Fitness tracker with SpO2, heart rate, sleep tracking, 10-day battery, IP68 waterproof.', platforms: ['FLIPKART', 'AMAZON'], variants: [{ name: 'Black', sku: 'SPRT-FB-FTR30-BLK', price: 1495, attributes: { color: 'Black' } }, { name: 'Green', sku: 'SPRT-FB-FTR30-GRN', price: 1495, attributes: { color: 'Green' } }] },
  { name: 'Decathlon Hiking Backpack 40L', brand: 'Quechua', category: 6, sku: 'SPRT-BP-QUA40', basePrice: 1999, description: 'Ventilated back panel, rain cover, multiple pockets. For day hikes and weekend trips.', platforms: ['SHOPIFY', 'WOOCOMMERCE'], variants: [{ name: 'Grey', sku: 'SPRT-BP-QUA40-GRY', price: 1999, attributes: { color: 'Grey' } }] },
  { name: 'Cosco Cricket Bat Kashmir Willow', brand: 'Cosco', category: 6, sku: 'SPRT-CB-CSC01', basePrice: 1099, description: 'Full size Kashmir willow cricket bat. Lightweight with premium grip. Ideal for tennis ball cricket.', platforms: ['FLIPKART', 'MEESHO'], variants: [{ name: 'Standard', sku: 'SPRT-CB-CSC01-STD', price: 1099, attributes: {} }] },
];

// ─── Generator ──────────────────────────────────────────────────────────────

let _nextId = 1000;

export interface DemoData {
  categories: Category[];
  products: Product[];
  listings: Listing[];
  orders: Order[];
  inventory: Inventory[];
  platforms: Platform[];    // all possible platforms with details
}

export function generateDemoData(): DemoData {
  _nextId = 1000; // reset for determinism across calls

  // Categories
  const categories: Category[] = CATEGORY_DEFS.map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentId,
    children: [],
  }));

  // Products (from seeds)
  const products: Product[] = PRODUCT_SEEDS.map((seed, idx) => {
    const productId = 100 + idx;
    const variants: ProductVariant[] = seed.variants.map((v, vi) => ({
      id: productId * 100 + vi + 1,
      sku: v.sku,
      variantName: v.name,
      attributes: v.attributes,
      price: v.price,
    }));

    return {
      id: productId,
      name: seed.name,
      description: seed.description,
      categoryId: seed.category,
      categoryName: CATEGORY_DEFS.find((c) => c.id === seed.category)?.name ?? '',
      sku: seed.sku,
      basePrice: seed.basePrice,
      brand: seed.brand,
      weight: +(Math.random() * 5 + 0.1).toFixed(2),
      length: +(Math.random() * 40 + 5).toFixed(1),
      width: +(Math.random() * 30 + 3).toFixed(1),
      height: +(Math.random() * 20 + 1).toFixed(1),
      images: [],
      variants,
      status: 'ACTIVE' as const,
      sellerId: 1,
      createdAt: daysAgo(rand(30, 90)),
      updatedAt: daysAgo(rand(0, 10)),
    };
  });

  // Listings: one per product × platform
  const listings: Listing[] = [];
  let listingId = 5000;
  // Build a platformId map — must match allPlatforms IDs below
  const platformTypeToId: Record<string, number> = {
    AMAZON: 9, SHOPIFY: 10, FLIPKART: 11, MEESHO: 12, BLINKIT: 13, WOOCOMMERCE: 14,
  };

  for (const product of products) {
    const seed = PRODUCT_SEEDS.find((s) => s.sku === product.sku)!;
    for (const pt of seed.platforms) {
      const status: ListingStatus = Math.random() < 0.85 ? 'ACTIVE' : Math.random() < 0.5 ? 'PENDING' : 'FAILED';
      listings.push({
        id: listingId++,
        productId: product.id,
        productName: product.name,
        platformId: platformTypeToId[pt]!,
        platformType: pt as PlatformType,
        externalId: `EXT-${pt.slice(0, 3)}-${rand(100000, 999999)}`,
        status,
        errorMessage: status === 'FAILED' ? 'Image dimensions do not meet platform requirements' : undefined,
        createdAt: daysAgo(rand(10, 60)),
        syncedAt: daysAgo(rand(0, 2)),
      });
    }
  }

  // Orders: ~150 orders spread across platforms and last 30 days
  const orders: Order[] = [];
  const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const STATUS_WEIGHTS = [15, 10, 10, 20, 40, 5]; // delivery-heavy realistic distribution

  function weightedStatus(): OrderStatus {
    const total = STATUS_WEIGHTS.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < ORDER_STATUSES.length; i++) {
      r -= STATUS_WEIGHTS[i]!;
      if (r <= 0) return ORDER_STATUSES[i]!;
    }
    return 'DELIVERED';
  }

  for (let i = 0; i < 160; i++) {
    const orderId = 3000 + i;
    // Pick a random platform type
    const platformType = pick(ALL_PLATFORM_TYPES);
    // Pick 1-3 products that are on this platform
    const platformProducts = products.filter((p) => {
      const seed = PRODUCT_SEEDS.find((s) => s.sku === p.sku)!;
      return seed.platforms.includes(platformType);
    });
    if (platformProducts.length === 0) continue;

    const orderProducts = pickN(platformProducts, rand(1, Math.min(3, platformProducts.length)));
    const customerName = randomName();
    const status = weightedStatus();
    const orderDate = randomDate(30);

    const items: OrderItem[] = orderProducts.map((p, idx) => {
      const variant = pick(p.variants);
      const qty = rand(1, 4);
      return {
        id: orderId * 100 + idx,
        productName: p.name,
        variantName: variant.variantName,
        sku: variant.sku,
        quantity: qty,
        unitPrice: variant.price,
        totalPrice: variant.price * qty,
      };
    });

    const totalAmount = items.reduce((s, it) => s + it.totalPrice, 0);

    orders.push({
      id: orderId,
      externalOrderId: `${platformType.slice(0, 3)}-${String(rand(100000, 999999))}`,
      platformType,
      status,
      customerName,
      customerEmail: randomEmail(customerName),
      customerPhone: randomPhone(),
      shippingAddress: randomAddress(),
      items,
      totalAmount,
      trackingNumber: status === 'SHIPPED' || status === 'DELIVERED' ? `TRK${rand(1000000, 9999999)}` : undefined,
      courierPartner: status === 'SHIPPED' || status === 'DELIVERED' ? pick(COURIERS) : undefined,
      warehouseId: 1,
      createdAt: orderDate,
      updatedAt: orderDate,
    });
  }

  // Sort orders by date descending
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Inventory: one entry per variant (single warehouse)
  const inventory: Inventory[] = [];
  let invId = 7000;
  for (const product of products) {
    for (const variant of product.variants) {
      const total = rand(5, 500);
      const reserved = rand(0, Math.min(30, total));
      const lowThreshold = 15;
      inventory.push({
        id: invId++,
        productVariantId: variant.id,
        variantName: variant.variantName,
        sku: variant.sku,
        warehouseId: 1,
        warehouseName: 'Primary Warehouse - Mumbai',
        quantity: total,
        reservedQuantity: reserved,
        availableQuantity: total - reserved,
        updatedAt: daysAgo(rand(0, 5)),
      });
    }
  }

  // Ensure some items are low-stock for dashboard alerts
  const lowStockTargets = pickN(inventory, 8);
  for (const inv of lowStockTargets) {
    inv.quantity = rand(3, 12);
    inv.reservedQuantity = rand(0, Math.min(3, inv.quantity));
    inv.availableQuantity = inv.quantity - inv.reservedQuantity;
  }

  // Platform definitions (all 6, to be filtered by connected set)
  const allPlatforms: Platform[] = [
    { id: 9, platformType: 'AMAZON', storeName: 'My Amazon Seller Central', isActive: true, connectedAt: daysAgo(rand(5, 30)) },
    { id: 10, platformType: 'SHOPIFY', storeName: 'My Shopify Store', isActive: true, connectedAt: daysAgo(rand(5, 30)) },
    { id: 11, platformType: 'FLIPKART', storeName: 'My Flipkart Seller Hub', isActive: true, connectedAt: daysAgo(rand(5, 30)) },
    { id: 12, platformType: 'MEESHO', storeName: 'My Meesho Shop', isActive: true, connectedAt: daysAgo(rand(5, 30)) },
    { id: 13, platformType: 'BLINKIT', storeName: 'My Blinkit Partner', isActive: true, connectedAt: daysAgo(rand(5, 30)) },
    { id: 14, platformType: 'WOOCOMMERCE', storeName: 'My WooCommerce Site', isActive: true, connectedAt: daysAgo(rand(5, 30)) },
  ];

  return { categories, products, listings, orders, inventory, platforms: allPlatforms };
}

// ─── Filtering by connected platforms ───────────────────────────────────────

/**
 * Given connected onboarding platform IDs (e.g. ['amazon', 'flipkart']),
 * return the PlatformTypes that are active in the demo.
 */
export function connectedPlatformTypes(connectedIds: string[]): PlatformType[] {
  const types = new Set<PlatformType>();
  for (const id of connectedIds) {
    const pt = PLATFORM_ID_TO_TYPE[id];
    if (pt) types.add(pt);
  }
  return Array.from(types);
}

/**
 * Filter demo data to only show data belonging to connected platforms.
 */
export function filterByPlatforms(data: DemoData, platformTypes: PlatformType[]) {
  const ptSet = new Set(platformTypes);

  const filteredPlatforms = data.platforms.filter((p) => ptSet.has(p.platformType));

  // Products: keep if any of its platform assignments overlap
  const productSeeds = new Map(PRODUCT_SEEDS.map((s) => [s.sku, s]));
  const filteredProducts = data.products.filter((p) => {
    const seed = productSeeds.get(p.sku);
    if (!seed) return true; // Keep user-generated products
    return seed.platforms.some((pt) => ptSet.has(pt as PlatformType));
  });
  const filteredProductIds = new Set(filteredProducts.map((p) => p.id));
  const filteredVariantIds = new Set(filteredProducts.flatMap((p) => p.variants.map((v) => v.id)));

  const filteredListings = data.listings.filter(
    (l) => ptSet.has(l.platformType) && filteredProductIds.has(l.productId),
  );

  const filteredOrders = data.orders.filter((o) => ptSet.has(o.platformType));

  const filteredInventory = data.inventory.filter((inv) => filteredVariantIds.has(inv.productVariantId));

  return {
    categories: data.categories,
    products: filteredProducts,
    listings: filteredListings,
    orders: filteredOrders,
    inventory: filteredInventory,
    platforms: filteredPlatforms,
  };
}

/**
 * Compute order statistics from an order list.
 */
export function computeOrderStats(orders: Order[]): OrderStatistics {
  let totalRevenue = 0;
  let pending = 0, accepted = 0, shipped = 0, delivered = 0, cancelled = 0;

  for (const o of orders) {
    totalRevenue += o.totalAmount;
    switch (o.status) {
      case 'PENDING': pending++; break;
      case 'ACCEPTED': accepted++; break;
      case 'PROCESSING': accepted++; break; // count processing with accepted
      case 'SHIPPED': shipped++; break;
      case 'DELIVERED': delivered++; break;
      case 'CANCELLED': cancelled++; break;
    }
  }

  return {
    totalOrders: orders.length,
    pendingOrders: pending,
    acceptedOrders: accepted,
    shippedOrders: shipped,
    deliveredOrders: delivered,
    cancelledOrders: cancelled,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
  };
}
