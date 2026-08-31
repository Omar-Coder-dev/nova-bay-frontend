"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import { Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, AlertCircle } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/products/${productId}`);
        setProduct(response.data);
      } catch {
        toast.error("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Product Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested product could not be retrieved or does not exist.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/products")}
          className="mt-2 border-border"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products List
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Products
        </Link>

        <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <Package className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7 shrink-0" />
              Edit Product
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm line-clamp-1">
              Updating details and inventory for{" "}
              <span className="font-semibold text-foreground">{product.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:p-8">
        <ProductForm existingProduct={product} />
      </div>
    </div>
  );
}