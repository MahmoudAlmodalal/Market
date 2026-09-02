"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  User,
  UserRole,
  SellerProfileData,
  PaymentMethod,
  LoyaltyTier,
  AuthContextValue,
} from "@/types/user";
import type { Address } from "@/types/order";
import {
  MOCK_CUSTOMER,
  MOCK_SELLER_USER,
  MOCK_SELLER_PROFILE,
  MOCK_ADMIN_USER,
  MOCK_LOYALTY_TIER,
  MOCK_SAVED_ADDRESSES,
  MOCK_PAYMENT_METHODS,
  MOCK_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/mock/user";

export interface ExtendedAuthContextValue extends AuthContextValue {
  sellerProfile: SellerProfileData | null;
  loyaltyTier: LoyaltyTier;
  savedAddresses: Address[];
  paymentMethods: PaymentMethod[];
  notificationPreferences: NotificationPreferences;
  activeRole: UserRole;
  switchRole: (newRole: UserRole) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: number, address: Partial<Address>) => void;
  removeAddress: (id: number) => void;
  setDefaultAddress: (id: number) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  updateSellerProfile: (data: Partial<SellerProfileData>) => Promise<void>;
}

const AuthContext = createContext<ExtendedAuthContextValue | null>(null);

const STORAGE_KEYS = {
  USER: "souqi_auth_user_v1",
  SELLER_PROFILE: "souqi_seller_profile_v1",
  ADDRESSES: "souqi_saved_addresses_v1",
  NOTIFICATIONS: "souqi_notification_prefs_v1",
  ACTIVE_ROLE: "souqi_active_role_v1",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_CUSTOMER);
  const [sellerProfile, setSellerProfile] = useState<SellerProfileData | null>(MOCK_SELLER_PROFILE);
  const [loyaltyTier, setLoyaltyTier] = useState<LoyaltyTier>(MOCK_LOYALTY_TIER);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(MOCK_SAVED_ADDRESSES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(MOCK_NOTIFICATION_PREFERENCES);
  const [activeRole, setActiveRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedSeller = localStorage.getItem(STORAGE_KEYS.SELLER_PROFILE);
      const storedAddresses = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      const storedPrefs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const storedRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setActiveRole(storedRole as UserRole || parsedUser.role || "customer");
      } else {
        // Default demo customer initialized
        setUser(MOCK_CUSTOMER);
        setActiveRole("customer");
      }

      if (storedSeller) {
        setSellerProfile(JSON.parse(storedSeller));
      }

      if (storedAddresses) {
        setSavedAddresses(JSON.parse(storedAddresses));
      }

      if (storedPrefs) {
        setNotificationPreferences(JSON.parse(storedPrefs));
      }
    } catch (e) {
      console.warn("Could not read auth data from localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login handler
  const login = useCallback(
    async (email: string, password?: string): Promise<boolean> => {
      setIsLoading(true);
      // Simulate realistic network latency
      await new Promise((resolve) => setTimeout(resolve, 500));

      const cleanEmail = email.trim().toLowerCase();
      let loggedUser: User;
      let role: UserRole = "customer";

      if (cleanEmail.includes("seller") || cleanEmail === MOCK_SELLER_USER.email) {
        loggedUser = { ...MOCK_SELLER_USER };
        role = "seller";
      } else if (cleanEmail.includes("admin") || cleanEmail === MOCK_ADMIN_USER.email) {
        loggedUser = { ...MOCK_ADMIN_USER };
        role = "admin";
      } else {
        loggedUser = {
          ...MOCK_CUSTOMER,
          email: cleanEmail,
          name: email.split("@")[0] || MOCK_CUSTOMER.name,
        };
        role = "customer";
      }

      setUser(loggedUser);
      setActiveRole(role);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
      }

      setIsLoading(false);
      return true;
    },
    []
  );

  // Register handler
  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      role?: UserRole;
      password?: string;
    }): Promise<boolean> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const role = data.role || "customer";
      const newUser: User = {
        id: Date.now(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone || "+970 59-900-0000",
        role: role,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        default_neighborhood: "الرمال",
        default_city: "غزة",
        created_at: new Date().toISOString(),
      };

      setUser(newUser);
      setActiveRole(role);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
      }

      setIsLoading(false);
      return true;
    },
    []
  );

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    setActiveRole("customer");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    }
  }, []);

  // Switch role between customer & seller mode
  const switchRole = useCallback((newRole: UserRole) => {
    setActiveRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, newRole);
    }
  }, []);

  // Profile update handler
  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<void> => {
      if (!user) return;
      const updated: User = { ...user, ...data };
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      }
    },
    [user]
  );

  // Seller profile update handler
  const updateSellerProfile = useCallback(
    async (data: Partial<SellerProfileData>): Promise<void> => {
      if (!sellerProfile) return;
      const updated: SellerProfileData = { ...sellerProfile, ...data };
      setSellerProfile(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SELLER_PROFILE, JSON.stringify(updated));
      }
    },
    [sellerProfile]
  );

  // Address management methods
  const addAddress = useCallback(
    (address: Omit<Address, "id">) => {
      const newId = Date.now();
      const newAddress: Address = {
        ...address,
        id: newId,
        is_default: address.is_default || savedAddresses.length === 0,
      };

      let updatedList = [...savedAddresses];
      if (newAddress.is_default) {
        updatedList = updatedList.map((a) => ({ ...a, is_default: false }));
      }
      updatedList.push(newAddress);

      setSavedAddresses(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
      }
    },
    [savedAddresses]
  );

  const updateAddress = useCallback(
    (id: number, address: Partial<Address>) => {
      const updatedList = savedAddresses.map((a) => {
        if (a.id === id) {
          return { ...a, ...address };
        }
        if (address.is_default) {
          return { ...a, is_default: false };
        }
        return a;
      });

      setSavedAddresses(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
      }
    },
    [savedAddresses]
  );

  const removeAddress = useCallback(
    (id: number) => {
      const updatedList = savedAddresses.filter((a) => a.id !== id);
      // Ensure at least one is default if list is not empty
      if (updatedList.length > 0 && !updatedList.some((a) => a.is_default)) {
        updatedList[0].is_default = true;
      }
      setSavedAddresses(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
      }
    },
    [savedAddresses]
  );

  const setDefaultAddress = useCallback(
    (id: number) => {
      const updatedList = savedAddresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      }));
      setSavedAddresses(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
      }
    },
    [savedAddresses]
  );

  // Notification preferences updater
  const updateNotificationPreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      const updated = { ...notificationPreferences, ...prefs };
      setNotificationPreferences(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      }
    },
    [notificationPreferences]
  );

  const value = useMemo<ExtendedAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      sellerProfile,
      loyaltyTier,
      savedAddresses,
      paymentMethods,
      notificationPreferences,
      activeRole,
      login,
      register,
      logout,
      switchRole,
      updateProfile,
      updateSellerProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      updateNotificationPreferences,
    }),
    [
      user,
      isLoading,
      sellerProfile,
      loyaltyTier,
      savedAddresses,
      paymentMethods,
      notificationPreferences,
      activeRole,
      login,
      register,
      logout,
      switchRole,
      updateProfile,
      updateSellerProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      updateNotificationPreferences,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): ExtendedAuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
