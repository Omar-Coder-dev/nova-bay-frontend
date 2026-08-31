"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingCart } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 sm:h-20 sm:w-20">
          <XCircle className="h-8 w-8 text-red-500 sm:h-10 sm:w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Checkout Cancelled
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Your payment was cancelled. Your cart items are still saved.
          </p>
        </div>

        <div className="flex justify-center">
          <Link href="/cart" className="w-full sm:w-auto">
            <Button className="h-11 w-full bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.99] sm:h-10 sm:w-auto">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Return to Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}