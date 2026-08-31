"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Order } from "@/types";
import { Loader2, Package, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  paid: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<{ data: Order[] }>("/orders/my-orders");
        setOrders(response.data.data);
      } catch (err: any) {
        if (err.response?.status === 401) router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-foreground">My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-24 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-blue-500/50"
              >
                <div>
                  <p className="font-semibold text-foreground">Order #{order._id.slice(-8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-foreground">${order.totalAmount.toFixed(2)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}