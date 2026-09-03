import React from "react";
import { getProducts, getCategories } from "@/lib/api/resources";
import { listResults } from "@/lib/api/client";
import { CatalogView } from "@/components/catalog";

export const dynamic = "force-dynamic";

export interface CatalogPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    ordering?: "price" | "-price" | "created_at" | "-created_at";
    page?: string;
  }>;
}

export default async function CatalogPage(props: CatalogPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;

  const categoryId = searchParams.category ? parseInt(searchParams.category, 10) : undefined;
  const search = searchParams.search || undefined;
  const ordering = searchParams.ordering || undefined;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : undefined;

  const [productsPage, categories] = await Promise.all([
    getProducts({
      category: !isNaN(Number(categoryId)) ? categoryId : undefined,
      search,
      ordering,
      page: !isNaN(Number(page)) ? page : undefined,
    }),
    getCategories(),
  ]);

  const products = listResults(productsPage);

  return (
    <CatalogView
      products={products}
      categories={categories}
      totalCount={productsPage.count}
      initialSearch={search || ""}
      initialCategory={categoryId && !isNaN(categoryId) ? categoryId : null}
      initialOrdering={ordering || "-created_at"}
    />
  );
}
