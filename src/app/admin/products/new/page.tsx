"use client";

import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { ArrowLeft, PlusCircle } from "lucide-react";

export default function NewProductPage() {
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

        <div className="border-b border-border pb-4">
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <PlusCircle className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7 shrink-0" />
            Add New Product
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create a new product listing to feature in your store's catalog.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:p-8">
        <ProductForm />
      </div>
    </div>
  );
}