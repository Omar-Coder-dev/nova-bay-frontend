"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api";
import { Product, ProductsResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;

      const response = await api.get<ProductsResponse>("/products", { params });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone from the UI.`)) return;

    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product removed.");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground sm:text-3xl">
            <Package className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7 shrink-0" />
            Products Management
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage store catalog, edit items, and track stock levels.
          </p>
        </div>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button className="h-10 w-full bg-blue-600 hover:bg-blue-500 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-10 bg-card border-border pl-9 pr-9 text-xs sm:text-sm"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Mobile Layout: Stacked Cards (< 640px) */}
          <div className="space-y-3 sm:hidden">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {product.category.replace(/_/g, " ")}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-sm">
                      <span className="font-bold text-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          product.stock <= 5
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-border pt-3">
                  <Link href={`/admin/products/${product._id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="h-9 w-full">
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={deletingId === product._id}
                    onClick={() => handleDelete(product._id, product.name)}
                    className="h-9 flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    {deletingId === product._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No products found.
              </div>
            )}
          </div>

          {/* Desktop Layout: Table (>= 640px) */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-semibold text-foreground">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 capitalize text-muted-foreground">
                      {product.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                          product.stock <= 5
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "text-muted-foreground"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingId === product._id}
                          onClick={() => handleDelete(product._id, product.name)}
                          className="h-8 w-8 border-red-500/30 p-0 text-red-500 hover:bg-red-500/10"
                          aria-label={`Delete ${product.name}`}
                        >
                          {deletingId === product._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No products found.
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3 border-border"
              aria-label="Previous Page"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-3 border-border"
              aria-label="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}