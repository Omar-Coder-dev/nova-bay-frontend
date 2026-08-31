"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);

  // Sync initial address if user context loads late
  useEffect(() => {
    if (user?.address && !shippingAddress) {
      setShippingAddress(user.address);
    }
  }, [user?.address, shippingAddress]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      toast.error("Please provide a shipping address.");
      return;
    }

    setLoading(true);

    console.log("1. Checkout started");

    try {
      console.log("2. Sending checkout request");

      const response = await api.post<{ url: string }>(
        "/orders/create-checkout-session",
        {
          shippingAddress: shippingAddress.trim(),
        },
      );

      console.log("3. Backend responded:", response.data);

      if (response.data?.url) {
        console.log("4. Stripe URL:", response.data.url);
        window.top?.location.assign(response.data.url);
      } else {
        throw new Error("Invalid checkout response.");
      }
    } catch (err: any) {
      console.error("CHECKOUT ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("DATA:", err.response?.data);

      toast.error(
        err.response?.data?.message || err.message || "Checkout failed.",
      );

      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl">
          Checkout
        </h1>

        <form
          onSubmit={handleCheckout}
          className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6"
        >
          <div className="space-y-2">
            <Label
              htmlFor="shippingAddress"
              className="text-xs font-semibold text-foreground sm:text-sm"
            >
              Shipping Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                rows={3}
                placeholder="Street, city, country..."
                className="w-full resize-none rounded-lg border border-border bg-muted py-3 pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-relaxed text-blue-500">
            You&apos;ll be redirected to Stripe&apos;s secure checkout to
            complete payment.
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 active:scale-[0.99] sm:h-12 sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                Redirecting...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Continue to Payment
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
