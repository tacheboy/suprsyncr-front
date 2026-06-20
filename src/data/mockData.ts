// Mock data for the entire USP application

export interface Order {
  id: string;
  platform: string;
  customerName: string;
  items: number;
  total: number;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  platforms: string[];
  status: "active" | "draft" | "archived";
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface Listing {
  id: string;
  productName: string;
  platform: string;
  status: "active" | "inactive" | "pending" | "error";
  price: number;
  stock: number;
  lastSync: string;
}

export const mockOrders: Order[] = [
  { id: "ORD-2024-001", platform: "Shopify", customerName: "Rahul Sharma", items: 3, total: 2450, date: "2024-12-15", status: "delivered" },
  { id: "ORD-2024-002", platform: "Amazon", customerName: "Priya Patel", items: 1, total: 899, date: "2024-12-15", status: "shipped" },
  { id: "ORD-2024-003", platform: "Flipkart", customerName: "Amit Kumar", items: 2, total: 1650, date: "2024-12-14", status: "processing" },
  { id: "ORD-2024-004", platform: "Blinkit", customerName: "Sneha Gupta", items: 5, total: 3200, date: "2024-12-14", status: "pending" },
  { id: "ORD-2024-005", platform: "WooCommerce", customerName: "Vikram Singh", items: 1, total: 599, date: "2024-12-13", status: "cancelled" },
  { id: "ORD-2024-006", platform: "Shopify", customerName: "Ananya Reddy", items: 4, total: 4100, date: "2024-12-13", status: "delivered" },
  { id: "ORD-2024-007", platform: "Amazon", customerName: "Deepak Joshi", items: 2, total: 1800, date: "2024-12-12", status: "returned" },
  { id: "ORD-2024-008", platform: "Flipkart", customerName: "Kavita Nair", items: 3, total: 2750, date: "2024-12-12", status: "shipped" },
  { id: "ORD-2024-009", platform: "Blinkit", customerName: "Rajesh Menon", items: 1, total: 450, date: "2024-12-11", status: "delivered" },
  { id: "ORD-2024-010", platform: "Amazon", customerName: "Sita Devi", items: 2, total: 1200, date: "2024-12-11", status: "processing" },
  { id: "ORD-2024-011", platform: "Shopify", customerName: "Arjun Rao", items: 6, total: 5600, date: "2024-12-10", status: "delivered" },
  { id: "ORD-2024-012", platform: "WooCommerce", customerName: "Meera Iyer", items: 1, total: 750, date: "2024-12-10", status: "pending" },
  { id: "ORD-2024-013", platform: "Meesho", customerName: "Lakshmi Devi", items: 2, total: 1248, date: "2024-12-15", status: "processing" },
  { id: "ORD-2024-014", platform: "Meesho", customerName: "Ravi Shankar", items: 1, total: 899, date: "2024-12-14", status: "shipped" },
  { id: "ORD-2024-015", platform: "Meesho", customerName: "Pooja Mehta", items: 3, total: 1847, date: "2024-12-13", status: "delivered" },
];

export const mockProducts: Product[] = [
  { id: "PRD-001", name: "Organic Green Tea - 100g", sku: "TEA-GRN-100", category: "Beverages", price: 299, stock: 450, image: "🍵", platforms: ["Shopify", "Amazon", "Blinkit"], status: "active" },
  { id: "PRD-002", name: "Premium Basmati Rice - 5kg", sku: "RIC-BAS-5KG", category: "Grocery", price: 649, stock: 12, image: "🍚", platforms: ["Flipkart", "Blinkit", "Amazon"], status: "active" },
  { id: "PRD-003", name: "Cold Pressed Coconut Oil - 1L", sku: "OIL-COC-1L", category: "Grocery", price: 399, stock: 0, image: "🥥", platforms: ["Shopify", "WooCommerce"], status: "active" },
  { id: "PRD-004", name: "Handmade Soap Set - Pack of 4", sku: "SOP-HND-4PK", category: "Personal Care", price: 450, stock: 200, image: "🧼", platforms: ["Shopify", "Amazon", "Flipkart"], status: "active" },
  { id: "PRD-005", name: "Bamboo Toothbrush - Pack of 3", sku: "BTH-BMB-3PK", category: "Personal Care", price: 199, stock: 8, image: "🪥", platforms: ["Amazon", "WooCommerce"], status: "active" },
  { id: "PRD-006", name: "Organic Honey - 500g", sku: "HON-ORG-500", category: "Food", price: 549, stock: 180, image: "🍯", platforms: ["Shopify", "Blinkit", "Amazon", "Flipkart"], status: "active" },
  { id: "PRD-007", name: "Quinoa Seeds - 1kg", sku: "QNA-SED-1KG", category: "Health Food", price: 799, stock: 5, image: "🌾", platforms: ["Amazon"], status: "active" },
  { id: "PRD-008", name: "Turmeric Powder - 200g", sku: "TRM-PWD-200", category: "Spices", price: 149, stock: 600, image: "✨", platforms: ["Blinkit", "Flipkart"], status: "draft" },
  { id: "PRD-009", name: "Cotton Kurta Set - Women", sku: "KRT-CTN-WMN", category: "Fashion", price: 899, stock: 45, image: "👗", platforms: ["Meesho", "Flipkart"], status: "active" },
  { id: "PRD-010", name: "Jute Shopping Bag - Set of 3", sku: "BAG-JUT-3PK", category: "Home & Living", price: 349, stock: 120, image: "🛍️", platforms: ["Meesho", "Amazon"], status: "active" },
  { id: "PRD-011", name: "Handloom Cotton Saree", sku: "SAR-CTN-HND", category: "Fashion", price: 1499, stock: 28, image: "🥻", platforms: ["Meesho"], status: "active" },
];

export const mockInventory: InventoryItem[] = mockProducts.map(p => ({
  productId: p.id,
  productName: p.name,
  sku: p.sku,
  totalStock: p.stock + Math.floor(Math.random() * 20),
  reservedStock: Math.floor(Math.random() * 20),
  availableStock: p.stock,
  status: p.stock === 0 ? "out_of_stock" : p.stock < 15 ? "low_stock" : "in_stock",
}));

export const mockListings: Listing[] = [
  { id: "LST-001", productName: "Organic Green Tea - 100g", platform: "Shopify", status: "active", price: 299, stock: 450, lastSync: "2 min ago" },
  { id: "LST-002", productName: "Organic Green Tea - 100g", platform: "Amazon", status: "active", price: 319, stock: 448, lastSync: "5 min ago" },
  { id: "LST-003", productName: "Premium Basmati Rice - 5kg", platform: "Flipkart", status: "active", price: 649, stock: 12, lastSync: "1 min ago" },
  { id: "LST-004", productName: "Premium Basmati Rice - 5kg", platform: "Blinkit", status: "pending", price: 649, stock: 12, lastSync: "10 min ago" },
  { id: "LST-005", productName: "Cold Pressed Coconut Oil - 1L", platform: "Shopify", status: "error", price: 399, stock: 0, lastSync: "1 hr ago" },
  { id: "LST-006", productName: "Handmade Soap Set - Pack of 4", platform: "Amazon", status: "active", price: 450, stock: 200, lastSync: "3 min ago" },
  { id: "LST-007", productName: "Bamboo Toothbrush - Pack of 3", platform: "WooCommerce", status: "inactive", price: 199, stock: 8, lastSync: "2 hr ago" },
  { id: "LST-008", productName: "Organic Honey - 500g", platform: "Shopify", status: "active", price: 549, stock: 180, lastSync: "1 min ago" },
  { id: "LST-009", productName: "Cotton Kurta Set - Women", platform: "Meesho", status: "active", price: 899, stock: 45, lastSync: "3 min ago" },
  { id: "LST-010", productName: "Cotton Kurta Set - Women", platform: "Flipkart", status: "active", price: 899, stock: 45, lastSync: "4 min ago" },
  { id: "LST-011", productName: "Jute Shopping Bag - Set of 3", platform: "Meesho", status: "active", price: 349, stock: 120, lastSync: "2 min ago" },
  { id: "LST-012", productName: "Handloom Cotton Saree", platform: "Meesho", status: "active", price: 1499, stock: 28, lastSync: "5 min ago" },
];

export const revenueData = [
  { date: "Mon", revenue: 12400, orders: 18 },
  { date: "Tue", revenue: 15600, orders: 24 },
  { date: "Wed", revenue: 11200, orders: 15 },
  { date: "Thu", revenue: 18900, orders: 32 },
  { date: "Fri", revenue: 22100, orders: 38 },
  { date: "Sat", revenue: 19800, orders: 29 },
  { date: "Sun", revenue: 16500, orders: 22 },
];

export const platformRevenueData = [
  { platform: "Shopify", revenue: 45200, color: "#96BF48" },
  { platform: "Amazon", revenue: 38900, color: "#FF9900" },
  { platform: "Flipkart", revenue: 22400, color: "#2874F0" },
  { platform: "Blinkit", revenue: 12800, color: "#F5C518" },
  { platform: "WooCommerce", revenue: 8200, color: "#7B2D8E" },
  { platform: "Meesho", revenue: 3994, color: "#F43397" },
];

export const platforms = [
  { name: "Shopify", color: "#96BF48", connected: true, stores: 2, icon: "🛍️" },
  { name: "Amazon", color: "#FF9900", connected: true, stores: 1, icon: "📦" },
  { name: "Flipkart", color: "#2874F0", connected: true, stores: 1, icon: "🛒" },
  { name: "Blinkit", color: "#F5C518", connected: false, stores: 0, icon: "⚡" },
  { name: "WooCommerce", color: "#7B2D8E", connected: true, stores: 1, icon: "🌐" },
  { name: "Meesho", color: "#F43397", connected: false, stores: 0, icon: "🛍️" },
];

export function getStatusColor(status: string): string {
  switch (status) {
    case "delivered": case "active": case "in_stock": case "connected": return "success";
    case "shipped": case "processing": case "pending": case "low_stock": return "warning";
    case "cancelled": case "returned": case "out_of_stock": case "error": case "inactive": return "destructive";
    default: return "secondary";
  }
}
