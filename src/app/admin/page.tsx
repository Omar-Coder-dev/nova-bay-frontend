"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { AdminOverview, RevenueByCategory } from "@/types";
import {
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  Loader2,
  TrendingUp,
  PieChart,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-border/80">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        {value}
      </p>
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">
        {label}
      </p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  paid: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<
    RevenueByCategory[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, categoryRes] = await Promise.all([
          api.get<{ data: AdminOverview }>("/admin/overview"),
          api.get<{ data: RevenueByCategory[] }>("/admin/revenue-by-category"),
        ]);
        setOverview(overviewRes.data.data);
        setRevenueByCategory(categoryRes.data.data);
      } catch {
        // Handled silently for gated route
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !overview) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalOrders = Object.values(overview.ordersByStatus).reduce(
    (a, b) => a + b,
    0
  );
  const maxCategoryRevenue = Math.max(
    ...revenueByCategory.map((c) => c.revenue),
    1
  );

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <TrendingUp className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7 shrink-0" />
          Dashboard Overview
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          A real-time snapshot of store performance and key sales metrics.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${overview.totalRevenue.toFixed(2)}`}
          accent="bg-green-500/10 text-green-500 border border-green-500/20"
        />
        <StatCard
          icon={ShoppingBag}
          label="Paid Orders"
          value={overview.totalPaidOrders.toString()}
          accent="bg-blue-500/10 text-blue-500 border border-blue-500/20"
        />
        <StatCard
          icon={Package}
          label="Active Products"
          value={overview.totalProducts.toString()}
          accent="bg-purple-500/10 text-purple-500 border border-purple-500/20"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={overview.totalUsers.toString()}
          accent="bg-orange-500/10 text-orange-500 border border-orange-500/20"
        />
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <PieChart className="h-4 w-4 text-blue-500" />
            <h2 className="font-bold text-foreground text-sm sm:text-base">
              Orders by Status
            </h2>
          </div>
          <div className="space-y-4">
            {Object.entries(overview.ordersByStatus).map(([status, count]) => (
              <div key={status} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="capitalize text-muted-foreground font-medium">
                    {status}
                  </span>
                  <span className="font-bold text-foreground">{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${STATUS_COLORS[status]}`}
                    style={{
                      width: totalOrders
                        ? `${(count / totalOrders) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <h2 className="font-bold text-foreground text-sm sm:text-base">
              Revenue by Category
            </h2>
          </div>
          {revenueByCategory.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground sm:text-sm">
              No category sales data recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {revenueByCategory.map((cat) => (
                <div key={cat._id} className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="capitalize text-muted-foreground font-medium">
                      {cat._id.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-foreground">
                      ${cat.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${(cat.revenue / maxCategoryRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}