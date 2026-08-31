export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category:
    | "electronics"
    | "clothing"
    | "home_and_kitchen"
    | "beauty"
    | "sports"
    | "books";
  stock: number;
  imageUrl: string;
  averageRating: number;
  numReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Matches the exact shape returned by GET /api/products
export interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

// Every possible query param your backend's getProducts supports
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "rating";
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface CartItem {
  product: Product; // populated by backend, not just an ID
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string };
  product: string;
  rating: number;
  comment: string;
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  currentPage: number;
  totalPages: number;
  totalReviews: number;
}

export interface OrderItem {
  product: { _id: string; name: string; price: number; imageUrl: string };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "paid" | "completed" | "cancelled";
  shippingAddress: string;
  estimatedDelivery: string;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface AdminOverview {
  totalRevenue: number;
  totalPaidOrders: number;
  ordersByStatus: {
    pending: number;
    paid: number;
    completed: number;
    cancelled: number;
  };
  totalProducts: number;
  totalUsers: number;
}

export interface RevenueByCategory {
  _id: string; // category name
  revenue: number;
  unitsSold: number;
}