import React from "react";
import { getProducts, getCategories } from "@/lib/api/resources";
import { listResults } from "@/lib/api/client";
import { HomeFeedClient } from "@/components/feed";

export const dynamic = "force-dynamic";

export interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    ordering?: "price" | "-price" | "created_at" | "-created_at";
  }>;
}

export default async function HomePage(props: HomePageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;

  const categoryId = searchParams.category ? parseInt(searchParams.category, 10) : undefined;
  const search = searchParams.search || undefined;
  const ordering = searchParams.ordering || undefined;

  const [productsPage, categories] = await Promise.all([
    getProducts({
      category: !isNaN(Number(categoryId)) ? categoryId : undefined,
      search,
      ordering,
    }),
    getCategories(),
  ]);

  const products = listResults(productsPage);

  return (
    <HomeFeedClient
      products={products}
      categories={categories}
      totalCount={productsPage.count}
      initialSearch={search || ""}
      initialCategory={categoryId && !isNaN(categoryId) ? categoryId : null}
      initialOrdering={ordering || "-created_at"}
    />
  );
}
