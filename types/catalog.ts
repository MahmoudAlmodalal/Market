export type StockState = "available" | "low_stock" | "out_of_stock";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  product_count?: number;
  status?: "active" | "inactive";
}

export interface SellerSummary {
  id: number;
  business_name: string;
  description?: string;
  neighborhood?: string;
  city?: string;
  logo?: string;
  rating?: number;
  review_count?: number;
  delivery_time?: string;
  is_verified?: boolean;
}

export interface Seller extends SellerSummary {
  owner_id?: number;
  phone?: string;
  address?: string;
  is_active?: boolean;
  product_count?: number;
  created_at?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  sort_order: number;
  alt_text?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string; // E.g., "25.00"
  unit?: string;
  primary_image?: string;
  images?: ProductImage[];
  stock_state: StockState;
  available_quantity?: number; // Present only when stock <= LOW_STOCK_THRESHOLD
  stock_quantity?: number; // Visible to seller/admin only
  seller_name?: string;
  seller?: SellerSummary;
  category: {
    id: number;
    name: string;
    slug?: string;
  };
  tags?: string[];
  is_featured?: boolean;
  is_ai_suggested?: boolean;
  status?: "draft" | "under_review" | "published" | "rejected" | "archived";
  moderation_note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Story {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  seller_id?: number;
  seller_name?: string;
  badge?: string;
}

export interface PromotionalBanner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  cta_text?: string;
  link: string;
  badge?: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: number;
  seller?: number;
  ordering?: "price" | "-price" | "created_at" | "-created_at";
  stock_state?: StockState;
  page?: number;
  page_size?: number;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
