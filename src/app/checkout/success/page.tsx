"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, Package } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 sm:h-20 sm:w-20">
          <CheckCircle2 className="h-8 w-8 text-green-500 sm:h-10 sm:w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Payment Successful!
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Your order has been placed. A confirmation email is on its way to you.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/orders" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-11 w-full border-border text-foreground hover:bg-muted active:scale-[0.99] sm:h-10 sm:w-auto"
            >
              <Package className="mr-2 h-4 w-4" />
              View My Orders
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button className="h-11 w-full bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.99] sm:h-10 sm:w-auto">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}