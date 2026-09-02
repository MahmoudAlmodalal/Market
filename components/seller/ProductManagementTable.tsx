"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useLocale } from "@/lib/context/LocaleContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import {
  Package,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Archive,
  Eye,
  Search,
  Check,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Filter,
  CheckCircle,
} from "lucide-react";

export interface ProductManagementTableProps {
  products: Product[];
  onUpdateProducts?: (updatedProducts: Product[]) => void;
  onOpenAiAssistant?: (product?: Product) => void;
  className?: string;
}

type ProductFilterStatus = "all" | "active" | "low_stock" | "out_of_stock" | "draft" | "archived";

export function ProductManagementTable({
  products: initialProducts,
  onUpdateProducts,
  onOpenAiAssistant,
  className,
}: ProductManagementTableProps) {
  const { locale } = useLocale();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProductFilterStatus>("all");

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    description: string;
    price: string;
    unit: string;
    stock_quantity: number;
    category_name: string;
    tags: string;
  }>({
    name: "",
    description: "",
    price: "",
    unit: "قطعة",
    stock_quantity: 10,
    category_name: "عناية وصابون",
    tags: "",
  });

  // Keep internal products in sync if prop changes
  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const updateProductList = (updated: Product[]) => {
    setProducts(updated);
    if (onUpdateProducts) {
      onUpdateProducts(updated);
    }
  };

  // Stock Adjuster Handler
  const handleAdjustStock = (productId: number, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const currentStock = p.stock_quantity ?? p.available_quantity ?? 0;
        const newStock = Math.max(0, currentStock + delta);
        let stockState: Product["stock_state"] = "available";
        if (newStock === 0) stockState = "out_of_stock";
        else if (newStock <= 5) stockState = "low_stock";

        return {
          ...p,
          stock_quantity: newStock,
          available_quantity: newStock,
          stock_state: stockState,
        };
      }
      return p;
    });

    updateProductList(updated);
  };

  // Toggle Publish / Draft
  const handleTogglePublish = (productId: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextStatus: "draft" | "published" = p.status === "published" ? "draft" : "published";
        return { ...p, status: nextStatus };
      }
      return p;
    });
    updateProductList(updated);
  };

  // Archive Product
  const handleArchive = (productId: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, status: "archived" as const };
      }
      return p;
    });
    updateProductList(updated);
  };

  // Delete Product
  const handleDelete = (productId: number) => {
    const updated = products.filter((p) => p.id !== productId);
    updateProductList(updated);
  };

  // Edit Save Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedStock = editingProduct.stock_quantity ?? 0;
    let stockState: Product["stock_state"] = "available";
    if (updatedStock === 0) stockState = "out_of_stock";
    else if (updatedStock <= 5) stockState = "low_stock";

    const updated = products.map((p) =>
      p.id === editingProduct.id
        ? {
            ...editingProduct,
            stock_state: stockState,
            available_quantity: updatedStock,
          }
        : p
    );

    updateProductList(updated);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Add Product Handler
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const stockQty = Number(newProduct.stock_quantity) || 0;
    let stockState: Product["stock_state"] = "available";
    if (stockQty === 0) stockState = "out_of_stock";
    else if (stockQty <= 5) stockState = "low_stock";

    const created: Product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price: parseFloat(newProduct.price).toFixed(2),
      unit: newProduct.unit || "قطعة",
      stock_state: stockState,
      stock_quantity: stockQty,
      available_quantity: stockQty,
      seller_name: "مشغل الياسمين",
      category: {
        id: 2,
        name: newProduct.category_name,
        slug: "care",
      },
      tags: newProduct.tags
        ? newProduct.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      is_featured: false,
      is_ai_suggested: false,
      status: "published",
      created_at: new Date().toISOString(),
      primary_image:
        "https://images.unsplash.com/photo-1607006314644-8854c86d8a39?auto=format&fit=crop&w=400&q=80",
    };

    updateProductList([created, ...products]);
    setIsAddModalOpen(false);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      unit: "قطعة",
      stock_quantity: 10,
      category_name: "عناية وصابون",
      tags: "",
    });
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Query match
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query);

      if (!matchQuery) return false;

      const stock = p.stock_quantity ?? p.available_quantity ?? 0;
      if (filterStatus === "active") {
        return p.status === "published" && stock > 0;
      }
      if (filterStatus === "low_stock") {
        return stock > 0 && stock <= 5;
      }
      if (filterStatus === "out_of_stock") {
        return stock <= 0 || p.stock_state === "out_of_stock";
      }
      if (filterStatus === "draft") {
        return p.status === "draft" || p.status === "under_review";
      }
      if (filterStatus === "archived") {
        return p.status === "archived";
      }

      return true;
    });
  }, [products, searchQuery, filterStatus]);

  // Status Badge Helper
  const renderStatusBadge = (p: Product) => {
    const stock = p.stock_quantity ?? p.available_quantity ?? 0;

    if (p.status === "archived") {
      return (
        <Badge variant="neutral" size="sm">
          {locale === "ar" ? "مؤرشف" : "Archived"}
        </Badge>
      );
    }
    if (p.status === "draft") {
      return (
        <Badge variant="warning" size="sm">
          {locale === "ar" ? "مسودة" : "Draft"}
        </Badge>
      );
    }
    if (p.status === "under_review") {
      return (
        <Badge variant="info" size="sm">
          {locale === "ar" ? "قيد المراجعة" : "Under Review"}
        </Badge>
      );
    }
    if (stock <= 0 || p.stock_state === "out_of_stock") {
      return (
        <Badge variant="danger" size="sm">
          {locale === "ar" ? "نفد المخزون" : "Out of Stock"}
        </Badge>
      );
    }
    if (stock <= 5 || p.stock_state === "low_stock") {
      return (
        <Badge variant="warning" size="sm">
          {locale === "ar" ? `متبقي ${stock}` : `${stock} Left`}
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm">
        {locale === "ar" ? "نشط ومتاح" : "Active"}
      </Badge>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Controls: Search Bar & Add Product CTA */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === "ar"
                ? "البحث في قائمة المنتجات..."
                : "Search inventory items..."
            }
            className="w-full h-10 ps-9 pe-3 bg-neutral-100 border-none rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <Button
          size="sm"
          variant="brand"
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 font-bold"
        >
          <Plus className="w-4 h-4 me-1" />
          {locale === "ar" ? "إضافة منتج" : "New Product"}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {(
          [
            { id: "all", labelAr: "الكل", labelEn: "All" },
            { id: "active", labelAr: "نشط", labelEn: "Active" },
            { id: "low_stock", labelAr: "مخزون منخفض", labelEn: "Low Stock" },
            { id: "out_of_stock", labelAr: "نفد", labelEn: "Out of Stock" },
            { id: "draft", labelAr: "مسودات", labelEn: "Drafts" },
            { id: "archived", labelAr: "مؤرشف", labelEn: "Archived" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all text-xs",
              filterStatus === tab.id
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            {locale === "ar" ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Product List / Cards */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-sm font-bold text-neutral-800">
              {locale === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
            </p>
            <p className="text-xs text-neutral-500">
              {locale === "ar"
                ? "جرّب تغيير عبارة البحث أو الفلتر المحدد"
                : "Try adjusting your search query or filter"}
            </p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const stock = p.stock_quantity ?? p.available_quantity ?? 0;
            return (
              <div
                key={p.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all space-y-3"
              >
                {/* Top: Image, Title, Price, Status */}
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    {p.primary_image ? (
                      <Image
                        src={p.primary_image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-tight">
                        {p.name}
                      </h4>
                      <div className="shrink-0">{renderStatusBadge(p)}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-brand-600 tabular-nums">
                        {p.price}{" "}
                        <span className="text-[10px] font-semibold">
                          {locale === "ar" ? "ر.س" : "SAR"}
                        </span>
                      </span>
                      {p.category?.name && (
                        <span className="text-[11px] text-neutral-400">
                          • {p.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock Quantity Stepper & Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  {/* Stock Quick Stepper */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-neutral-500 me-1">
                      {locale === "ar" ? "المخزون:" : "Stock:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(p.id, -1)}
                      disabled={stock <= 0}
                      className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 flex items-center justify-center text-neutral-700 transition-colors"
                      aria-label="Decrease stock"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold tabular-nums text-neutral-900">
                      {stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(p.id, 1)}
                      className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors"
                      aria-label="Increase stock"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-1">
                    {/* AI Generator Helper */}
                    {onOpenAiAssistant && (
                      <button
                        type="button"
                        onClick={() => onOpenAiAssistant(p)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                        title={locale === "ar" ? "توليد وصف بالذكاء الاصطناعي" : "AI Description"}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(p);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                      title={locale === "ar" ? "تعديل" : "Edit"}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Archive / Unarchive */}
                    <button
                      type="button"
                      onClick={() =>
                        p.status === "archived"
                          ? handleTogglePublish(p.id)
                          : handleArchive(p.id)
                      }
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                      title={
                        p.status === "archived"
                          ? locale === "ar"
                            ? "استعادة"
                            : "Restore"
                          : locale === "ar"
                          ? "أرشفة"
                          : "Archive"
                      }
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title={locale === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingProduct && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          title={locale === "ar" ? "تعديل بيانات المنتج" : "Edit Product"}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3 pt-1">
            <Input
              label={locale === "ar" ? "اسم المنتج" : "Product Title"}
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label={locale === "ar" ? "السعر (ر.س)" : "Price (SAR)"}
                type="number"
                step="0.5"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, price: e.target.value })
                }
                required
              />
              <Input
                label={locale === "ar" ? "الكمية المتوفرة بالمخزون" : "Stock Quantity"}
                type="number"
                value={editingProduct.stock_quantity ?? editingProduct.available_quantity ?? 0}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock_quantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">
                {locale === "ar" ? "وصف المنتج" : "Product Description"}
              </label>
              <textarea
                rows={3}
                value={editingProduct.description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" variant="brand" size="sm">
                {locale === "ar" ? "حفظ التعديلات" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={locale === "ar" ? "إضافة منتج جديد للمتجر" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-3 pt-1">
          <Input
            label={locale === "ar" ? "اسم المنتج" : "Product Title"}
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder={locale === "ar" ? "مثال: زيت زيتون بلدي بكر ممتاز" : "e.g. Extra Virgin Olive Oil"}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label={locale === "ar" ? "السعر (ر.س)" : "Price (SAR)"}
              type="number"
              step="0.5"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="45.00"
              required
            />
            <Input
              label={locale === "ar" ? "كمية المخزون الأولي" : "Initial Stock"}
              type="number"
              value={newProduct.stock_quantity}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock_quantity: parseInt(e.target.value, 10) || 0,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label={locale === "ar" ? "القسم / التصنيف" : "Category"}
              value={newProduct.category_name}
              onChange={(e) => setNewProduct({ ...newProduct, category_name: e.target.value })}
              placeholder={locale === "ar" ? "مأكولات ومؤونة" : "Food"}
            />
            <Input
              label={locale === "ar" ? "الكلمات المفتاحية (مفصولة بفاصلة)" : "Tags (comma-separated)"}
              value={newProduct.tags}
              onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
              placeholder="بلدي, عضوي, طازج"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800">
              {locale === "ar" ? "الوصف التفصيلي" : "Description"}
            </label>
            <textarea
              rows={3}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder={locale === "ar" ? "وصف مميزات المنتج وطريقة الاستخدام..." : "Product features..."}
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="brand" size="sm">
              {locale === "ar" ? "إضافة المنتج ونشره" : "Add & Publish"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductManagementTable;
