"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import api from "@/lib/api";
import { Product, ProductsResponse } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  PackageX,
  RotateCcw,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home_and_kitchen", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(urlCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [minRating, setMinRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const [showFilters, setShowFilters] = useState(false);

  // Sync category state with URL parameters when navigation occurs
  useEffect(() => {
    setCategory(urlCategory);
  }, [urlCategory]);

  const fetchProducts = useCallback(
    async (page: number) => {
      setLoading(true);
      setError("");

      try {
        const params: Record<string, string | number> = { page, limit: 12 };

        if (search) params.search = search;
        if (category !== "all") params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (inStock) params.inStock = "true";
        if (minRating !== "all") params.minRating = minRating;
        if (sortBy !== "newest") params.sortBy = sortBy;

        const response = await api.get<ProductsResponse>("/products", {
          params,
        });

        setProducts(response.data.products);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    },
    [search, category, minPrice, maxPrice, inStock, minRating, sortBy]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handlePageChange = (page: number) => {
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setMinRating("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    Boolean(search) ||
    category !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStock ||
    minRating !== "all" ||
    sortBy !== "newest";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-border pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-semibold tracking-wide">
              <Sparkles className="h-4 w-4" />
              <span>STOREFRONT CATALOG</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              All Products
            </h1>
            <p className="text-base text-muted-foreground">
              {loading ? (
                <span className="animate-pulse">Fetching inventory...</span>
              ) : (
                <span>
                  Showing <strong className="text-foreground">{products.length}</strong> of{" "}
                  <strong className="text-foreground">{totalProducts}</strong> items
                </span>
              )}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-blue-500" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-card border-border text-foreground text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 rounded-xl transition-all shadow-inner backdrop-blur-md"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 lg:shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4 w-full bg-card border-border text-foreground hover:bg-muted lg:hidden h-12 rounded-xl flex items-center justify-between px-4 text-base"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Filter Products</span>
              </div>
              {hasActiveFilters && (
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              )}
            </Button>

            <div
              className={`space-y-6 rounded-2xl border border-border bg-card p-6 backdrop-blur-xl shadow-2xl transition-all ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 font-bold text-foreground text-base">
                  <Filter className="h-5 w-5 text-blue-500" />
                  <span>Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-muted border-border text-foreground text-sm focus:ring-2 focus:ring-blue-500/40 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all" className="text-sm">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-sm">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price Range ($)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-muted border-border text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-blue-500/40 rounded-xl h-11"
                  />
                  <span className="text-muted-foreground font-bold">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-muted border-border text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-blue-500/40 rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Minimum Rating
                </Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full bg-muted border-border text-foreground text-sm focus:ring-2 focus:ring-blue-500/40 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all" className="text-sm">Any Rating</SelectItem>
                    <SelectItem value="4" className="text-sm">4★ & above</SelectItem>
                    <SelectItem value="3" className="text-sm">3★ & above</SelectItem>
                    <SelectItem value="2" className="text-sm">2★ & above</SelectItem>
                    <SelectItem value="1" className="text-sm">1★ & above</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* In Stock Toggle */}
              <label className="flex cursor-pointer items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-semibold text-muted-foreground">
                  In stock only
                </span>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-5 w-5 rounded border-border bg-background text-blue-600 focus:ring-blue-500/40 focus:ring-offset-0 accent-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card border border-border px-5 py-3.5 rounded-2xl backdrop-blur-xl">
              {/* Active Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {category !== "all" && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm font-medium text-blue-500">
                    Category: {CATEGORIES.find((c) => c.value === category)?.label}
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-foreground"
                      onClick={() => setCategory("all")}
                    />
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm font-medium text-blue-500">
                    Price: ${minPrice || "0"} - ${maxPrice || "∞"}
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-foreground"
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                    />
                  </span>
                )}
                {inStock && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm font-medium text-blue-500">
                    In Stock Only
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-foreground"
                      onClick={() => setInStock(false)}
                    />
                  </span>
                )}
                {!hasActiveFilters && (
                  <span className="text-sm text-muted-foreground font-medium">
                    No active filters applied
                  </span>
                )}
              </div>

              {/* Sort Control */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-10 bg-muted border-border text-foreground text-sm focus:ring-2 focus:ring-blue-500/40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="newest" className="text-sm">Newest Arrivals</SelectItem>
                    <SelectItem value="price_asc" className="text-sm">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc" className="text-sm">Price: High to Low</SelectItem>
                    <SelectItem value="rating" className="text-sm">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl bg-card border border-border p-4 space-y-4 animate-pulse"
                  >
                    <div className="h-44 w-full rounded-xl bg-muted" />
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="h-5 w-1/2 rounded bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center text-red-500 space-y-2 backdrop-blur-md">
                <X className="h-8 w-8 mx-auto text-red-500 opacity-80" />
                <p className="font-semibold text-base">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="rounded-2xl border border-border bg-card py-20 px-4 text-center space-y-4 backdrop-blur-xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border">
                  <PackageX className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    No products found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any items matching your current filters or search terms.
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white hover:bg-blue-500 h-10 rounded-xl text-sm font-semibold px-5 transition-all"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                    <p className="text-sm font-medium text-muted-foreground">
                      Page <strong className="text-foreground text-base">{currentPage}</strong> of{" "}
                      <strong className="text-foreground text-base">{totalPages}</strong>
                    </p>

                    <div className="flex items-center gap-3">
                      <Button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="bg-card border border-border text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-card shadow-sm transition-all h-10 px-4 rounded-xl text-sm font-medium"
                      >
                        <ChevronLeft className="mr-1.5 h-4 w-4" />
                        Previous
                      </Button>

                      <Button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="bg-card border border-border text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-card shadow-sm transition-all h-10 px-4 rounded-xl text-sm font-medium"
                      >
                        Next
                        <ChevronRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}