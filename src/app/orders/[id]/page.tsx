"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, MapPin, Calendar, XCircle } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  paid: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get<{ data: Order }>(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/login");
      else toast.error("Order not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled.");
      // Redirect back to the list - nothing more to do on a cancelled order's page
      router.push("/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel order.");
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!order) return null;

  const canCancel = order.status === "pending" || order.status === "paid";

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order #{order._id.slice(-8)}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-6">
            {order.items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{order.shippingAddress}</span>
          </div>

          <div className="mt-6 flex justify-between border-t border-border pt-6 text-lg font-bold text-foreground">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>

          {canCancel && (
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="outline"
              className="mt-6 w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
            >
              {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}