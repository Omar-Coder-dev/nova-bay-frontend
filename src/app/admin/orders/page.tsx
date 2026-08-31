"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, ShoppingBag, User } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  paid: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
};

// Mirrors the backend's ALLOWED_TRANSITIONS exactly - the dropdown only
// ever offers moves the backend would actually accept.
const NEXT_STATUS_OPTIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.get<{ data: Order[]; pages: number }>(
        "/orders",
        { params }
      );
      setOrders(response.data.data);
      setTotalPages(response.data.pages);
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground sm:text-3xl">
            <ShoppingBag className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7 shrink-0" />
            Orders Management
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            View, filter, and modify customer order processing states.
          </p>
        </div>

        {/* Filter Trigger */}
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-full bg-card border-border text-xs sm:text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Mobile Layout: Stacked Interactive Cards (< 640px) */}
          <div className="space-y-3 sm:hidden">
            {orders.map((order) => {
              const customer = (order as any).user;
              const nextOptions = NEXT_STATUS_OPTIONS[order.status] || [];
              const isUpdating = updatingId === order._id;

              return (
                <div
                  key={order._id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div className="space-y-1">
                      <span className="font-mono text-sm font-bold text-foreground">
                        #{order._id.slice(-8)}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {customer?.name || "Anonymous User"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <p className="text-base font-extrabold text-foreground">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {nextOptions.length > 0 && (
                    <div className="pt-3">
                      <Select
                        disabled={isUpdating}
                        onValueChange={(val) => handleStatusChange(order._id, val)}
                      >
                        <SelectTrigger className="h-10 w-full bg-muted border-border text-xs">
                          {isUpdating ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                              <span>Updating status...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Advance order status..." />
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {nextOptions.map((opt) => (
                            <SelectItem
                              key={opt}
                              value={opt}
                              className="text-xs capitalize"
                            >
                              Mark as {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                No orders found matching criteria.
              </div>
            )}
          </div>

          {/* Desktop Layout: Responsive Data Table (>= 640px) */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const customer = (order as any).user;
                  const nextOptions = NEXT_STATUS_OPTIONS[order.status] || [];
                  const isUpdating = updatingId === order._id;

                  return (
                    <tr
                      key={order._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-muted-foreground">
                        {customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {nextOptions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Select
                            disabled={isUpdating}
                            onValueChange={(val) => handleStatusChange(order._id, val)}
                          >
                            <SelectTrigger className="ml-auto h-8 w-36 bg-muted border-border text-xs">
                              {isUpdating ? (
                                <div className="flex items-center gap-1.5">
                                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Update status" />
                              )}
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                              {nextOptions.map((opt) => (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className="text-xs capitalize"
                                >
                                  Mark as {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No orders found.
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
              <ChevronLeft className="h-4 w-4 mr-1" />
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
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}