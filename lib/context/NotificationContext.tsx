"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { NotificationItem } from "@/types";
import {
  getMockNotifications,
  saveMockNotifications,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock/notifications";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  hasUnread: boolean;
  isInitialized: boolean;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loaded = getMockNotifications();
    setNotifications(loaded);
    setIsInitialized(true);
  }, []);

  const persistNotifications = useCallback((updated: NotificationItem[]) => {
    setNotifications(updated);
    saveMockNotifications(updated);
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, read: true } : item
        );
        saveMockNotifications(updated);
        return updated;
      });
    },
    []
  );

  const markAsUnread = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, read: false } : item
        );
        saveMockNotifications(updated);
        return updated;
      });
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      saveMockNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveMockNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    persistNotifications([]);
  }, [persistNotifications]);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
      const newItem: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => {
        const updated = [newItem, ...prev];
        saveMockNotifications(updated);
        return updated;
      });
    },
    []
  );

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const hasUnread = unreadCount > 0;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      hasUnread,
      isInitialized,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      clearAll,
      addNotification,
    }),
    [
      notifications,
      unreadCount,
      hasUnread,
      isInitialized,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      clearAll,
      addNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function useOptionalNotifications() {
  return useContext(NotificationContext);
}
