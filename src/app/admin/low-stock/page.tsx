"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api";
import { Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Pencil, PackageX } from "lucide-react";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home_and_kitchen", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
];

export default function AdminLowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("stock_asc");

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { threshold, sortBy };
      if (category !== "all") params.category = category;

      const response = await api.get<{ data: Product[] }>("/admin/low-stock", {
        params,
      });
      setProducts(response.data.data);
    } catch {
      toast.error("Failed to load low-stock products.");
    } finally {
      setLoading(false);
    }
  }, [threshold, category, sortBy]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <AlertTriangle className="h-6 w-6 text-yellow-500 sm:h-7 sm:w-7 shrink-0" />
          Low Stock Alerts
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Products running low on inventory - restock before they sell out.
        </p>
      </div>

      {/* Controls row - Threshold, Category, Sort */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 rounded-2xl border border-border bg-card p-4">
        {/* Threshold */}
        <div className="flex items-center justify-between sm:justify-start gap-2 border-b sm:border-b-0 border-border pb-3 sm:pb-0">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            Threshold
          </label>
          <Input
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value) || 5)}
            className="w-24 bg-muted border-border text-base sm:text-sm h-10"
          />
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-44">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-muted border-border h-10 text-base sm:text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Select */}
        <div className="w-full sm:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-muted border-border h-10 text-base sm:text-sm">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="stock_asc">Lowest Stock First</SelectItem>
              <SelectItem value="stock_desc">Highest Stock First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          <PackageX className="h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm">Nothing below the threshold - inventory looks healthy.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout (< 768px) */}
          <div className="grid gap-3 md:hidden">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {product.category.replace(/_/g, " ")}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                        Stock: {product.stock}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link href={`/admin/products/${product._id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-10 border-border text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Restock Product
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-medium text-foreground line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {product.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-500">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Restock
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}