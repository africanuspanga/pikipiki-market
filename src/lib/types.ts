export type Brand = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
};

export type StockStatus = "in_stock" | "low_stock" | "sold_out" | "pre_order";

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category: string;
  condition: "new" | "used";
  price: number;
  old_price: number | null;
  year: number | null;
  engine_cc: number | null;
  mileage_km: number | null;
  fuel_type: string | null;
  transmission: string | null;
  top_speed_kmh: number | null;
  fuel_economy: string | null;
  color: string | null;
  stock_status: StockStatus;
  short_description: string | null;
  description: string | null;
  features: string[];
  is_featured: boolean;
  is_published: boolean;
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductWithRelations = Product & {
  brand: Brand | null;
  images: ProductImage[];
};

export type Testimonial = {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  content: string;
  bike: string | null;
  is_published: boolean;
  sort_order: number;
};

export type Inquiry = {
  id: string;
  product_id: string | null;
  name: string;
  phone: string;
  location: string | null;
  message: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
  product?: { name: string; slug: string; images: { url: string; sort_order: number }[] } | null;
};

export type Spare = {
  id: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  fits: string | null;
  description: string | null;
  image_url: string | null;
  storage_path: string | null;
  stock_status: "in_stock" | "sold_out";
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** Row in `site_settings`. Keys: "hero_image" (homepage hero bike photo URL). */
export type SiteSetting = {
  key: string;
  value: string | null;
  storage_path: string | null;
  updated_at: string;
};

export const SPARE_CATEGORIES = [
  "Spare part",
  "Engine",
  "Brakes",
  "Tyres & wheels",
  "Electrical",
  "Body parts",
  "Oils & lubricants",
  "Helmets & gear",
  "Accessories",
] as const;

export const CATEGORIES = [
  "Commuter",
  "Boda Boda",
  "Street",
  "Sport",
  "Adventure",
  "Off-Road",
  "Scooter",
  "Cruiser",
] as const;

export const STOCK_LABELS: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Few left",
  sold_out: "Sold",
  pre_order: "Pre-order",
};
