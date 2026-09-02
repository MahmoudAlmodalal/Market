import type { Product, StockState } from "./catalog";

export type CartIssueCode =
  | "price_changed"
  | "insufficient_stock"
  | "product_unavailable";

export interface CartIssue {
  code: CartIssueCode;
  message?: string;
  old_price?: string;
  new_price?: string;
  available?: number;
  product_id?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  stock_state: StockState;
  primary_image?: string;
  seller_name?: string;
  seller_id?: number;
  issues: CartIssue[];
  max_quantity?: number;
  price_at_addition?: string;
  current_server_price?: string;
}

export interface CartSeller {
  id: number;
  business_name: string;
  neighborhood?: string;
  phone?: string;
}

export interface PricingBreakdown {
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
  voucher_code?: string;
  voucher_applied?: boolean;
  voucher_error?: string;
  can_checkout?: boolean;
  blocking_reason?: string;
}

export interface Cart {
  id: number;
  seller?: CartSeller | null;
  items: CartItem[];
  subtotal: string;
  estimated_delivery?: string;
  discount_amount?: string;
  total?: string;
  has_blocking_issues: boolean;
  voucher_code?: string;
}

export interface CartConflictState {
  isOpen: boolean;
  pendingProduct: Product | null;
  pendingQuantity: number;
  existingSellerName?: string;
  newSellerName?: string;
}

export interface CartContextValue {
  cart: Cart;
  addItem: (
    product: Product,
    quantity?: number
  ) => {
    success: boolean;
    conflict?: boolean;
    sellerName?: string;
    existingSellerName?: string;
    newSellerName?: string;
  };
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  confirmSwitchSellerAndAdd: (product: Product, quantity?: number) => void;
  resolveIssue: (itemId: number, issueCode: string) => void;
  acceptPriceChange: (itemId: number) => void;
  clampQuantity: (itemId: number) => void;
  applyVoucher: (code: string) => {
    success: boolean;
    error?: string;
    discount?: number;
  };
  removeVoucher: () => void;
  voucherCode: string | null;
  discountAmount: number;
  voucherError: string | null;
  itemCount: number;
  hasBlockingIssues: boolean;
  isLoading: boolean;
  conflictState: CartConflictState | null;
  closeConflictDialog: () => void;
  getPricingBreakdown: () => PricingBreakdown;
  syncCartWithCatalog?: () => void;
}
