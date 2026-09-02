export type UserRole = "customer" | "seller" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  default_neighborhood?: string;
  default_city?: string;
  created_at?: string;
}

export interface SellerProfileData {
  id: number;
  business_name: string;
  description: string;
  neighborhood: string;
  city: string;
  phone: string;
  logo?: string;
  is_verified: boolean;
  is_active: boolean;
}

export type PaymentMethodType = "cod" | "card" | "apple_pay" | "digital_card";

export interface PaymentMethodData {
  id: string;
  type: PaymentMethodType;
  label: string;
  description?: string;
  is_default?: boolean;
}

export type PaymentMethod = PaymentMethodType | PaymentMethodData;

export interface LoyaltyTier {
  tier: "bronze" | "silver" | "gold";
  points: number;
  next_tier_points: number;
  benefits: string[];
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register?: (data: { name: string; email: string; phone?: string; role?: UserRole; password?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
