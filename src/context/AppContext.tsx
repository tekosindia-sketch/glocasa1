"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { shopify, GET_PRODUCTS, createCheckout } from "@/lib/shopify";

/* ─────────────── Type Definitions ─────────────── */

export interface Product {
  id: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  description: string;
  capacity: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  variants: { id: string; title: string }[]; // Store both variant ID and title
  tags: string[];
  gradientTheme: string;
  image?: string;
}

export interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  selectedVariant: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  address: string;
  paymentMethod: string;
  status: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  addresses: string[];
  loyaltyPoints: number;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  orders: Order[];
  user: UserProfile;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  addToCart: (product: Product, variant: string, qty: number) => void;
  removeFromCart: (productId: string | number, variant: string) => void;
  updateCartQuantity: (productId: string | number, variant: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  addOrder: (data: Omit<Order, "id" | "status" | "date">) => Order;
  adminUpdateOrderStatus: (orderId: string, status: string) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string | number) => void;
  addReview: (productId: string | number, review: Review) => void;
  checkout: () => Promise<void>;
}

/* ─────────────── Product Catalog ─────────────── */

const defaultProducts: Product[] = [];

/* ─────────────── Default User ─────────────── */

const defaultUser: UserProfile = {
  name: "Aditi Roy",
  email: "aditi.roy@gmail.com",
  addresses: [
    "Flat 12B, Marigold Towers, Bandra West, Mumbai 400050",
    "Villa 7, DLF Phase 3, Sector 24, Gurgaon 122002",
  ],
  loyaltyPoints: 85,
};

/* ─────────────── Context ─────────────── */

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("glocasa_cart");
      const savedWishlist = localStorage.getItem("glocasa_wishlist");
      const savedOrders = localStorage.getItem("glocasa_orders");
      const savedUser = localStorage.getItem("glocasa_user");
      const savedProducts = localStorage.getItem("glocasa_products");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const hasMock = parsed.some((p: any) => typeof p.id === 'number' && p.id <= 8);
        if (!hasMock) setProducts(parsed);
      }
    } catch (e) {
      console.error("Failed to hydrate state", e);
    }
    setHydrated(true);
  }, []);

  // Fetch real Shopify products
  useEffect(() => {
    async function fetchShopifyProducts() {
      try {
        const response: any = await shopify.request(GET_PRODUCTS, { first: 20 });
        const shopifyProducts = response?.products?.edges || [];
        if (shopifyProducts.length > 0) {
          const mapped: Product[] = shopifyProducts.map((edge: any, index: number) => {
            const node = edge.node;
            const imageUrl = node.images?.edges?.[0]?.node?.src || node.images?.edges?.[0]?.node?.url || "";
            
            // Extract numerical ID segment to prevent slashes in dynamic routing
            const rawId = node.id;
            const cleanId = rawId.toString().split("/").pop() || rawId;

            // Curated premium HSL-tailored gradients for modern aesthetic consistency
            const gradients = [
              "from-amber-100/50 to-orange-100/20",
              "from-yellow-100/50 to-amber-100/20",
              "from-purple-100/40 to-pink-100/20",
              "from-sky-100/40 to-blue-100/20",
              "from-orange-100/40 to-red-100/20",
              "from-stone-200/50 to-orange-100/20",
              "from-rose-100/40 to-pink-100/20",
            ];
            
            // Map Shopify variants to array of strings
            const variants = node.variants?.edges?.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
        })) || [];

            return {
              id: cleanId,
              name: node.title,
              price: Math.round(parseFloat(node.priceRange?.minVariantPrice?.amount || "1299")),
              category: node.productType || "Glassware",
              description: node.description || "Vertically fluted ribbed glassware crafted from lead-free premium borosilicate. Perfect for elegant kitchen shelving.",
              capacity: "350ml",
              rating: Math.round((4.5 + (index % 5) * 0.1) * 10) / 10,
              reviewCount: 45 + (index * 19) % 180,
              reviews: [
                { name: "Priya M.", rating: 5, text: "Absolutely gorgeous! The ribbed texture catches light beautifully.", date: "2026-04-12", verified: true },
                { name: "Ananya S.", rating: 5, text: "These are Pinterest-perfect. My coffee cart looks premium now.", date: "2026-03-28", verified: true },
              ],
              variants: variants.length > 0 ? variants : [{id: "default", title: "Standard"}],
              tags: node.tags || ["new", "glassware"],
              gradientTheme: gradients[index % gradients.length],
              image: imageUrl,
            };
          });
          setProducts(mapped);
        }
      } catch (error) {
        console.warn("Unable to connect to Shopify Storefront API. Keeping local glassware curations active.", error);
      }
    }
    fetchShopifyProducts();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("glocasa_cart", JSON.stringify(cart));
    localStorage.setItem("glocasa_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("glocasa_orders", JSON.stringify(orders));
    localStorage.setItem("glocasa_user", JSON.stringify(user));
    localStorage.setItem("glocasa_products", JSON.stringify(products));
  }, [cart, wishlist, orders, user, products, hydrated]);

  /* ── Cart ── */

  const addToCart = useCallback((product: Product, variant: string, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.selectedVariant === variant);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.selectedVariant === variant
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { product, selectedVariant: variant, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string | number, variant: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.selectedVariant === variant)));
  }, []);

  const updateCartQuantity = useCallback((productId: string | number, variant: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.selectedVariant === variant ? { ...i, quantity: qty } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  /* ── Wishlist ── */

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  /* ── Orders ── */

  const addOrder = useCallback((data: Omit<Order, "id" | "status" | "date">) => {
    const id = `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const order: Order = {
      ...data,
      id,
      status: "placed",
      date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    };
    setOrders((prev) => [...prev, order]);
    // Award loyalty points (₹10 spent = 1 point)
    const pointsEarned = Math.floor(data.total / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));
    return order;
  }, []);

  // Checkout using Shopify Storefront API
  const checkout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    const lineItems = cart.map((item) => ({
      variantId: item.selectedVariant as string,
      quantity: item.quantity,
    }));
    try {
      const checkoutUrl = await createCheckout(lineItems);
      clearCart();
      // Redirect to Shopify Checkout page
      if (typeof window !== 'undefined') {
        window.location.href = checkoutUrl;
      }
    } catch (e: any) {
      console.error('Checkout creation failed', e);
      showToast('Failed to initiate checkout. Please try again.', 'error');
    }
  };

  const adminUpdateOrderStatus = useCallback((orderId: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []);

  /* ── Products (Admin) ── */

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  const deleteProduct = useCallback((productId: string | number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const addReview = useCallback((productId: string | number, review: Review) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newReviews = [...p.reviews, review];
        const newRating = newReviews.reduce((s, r) => s + r.rating, 0) / newReviews.length;
        return { ...p, reviews: newReviews, reviewCount: newReviews.length, rating: Math.round(newRating * 10) / 10 };
      })
    );
  }, []);

  /* ── Toast ── */

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const contextValue: AppContextType = {
    products,
    cart,
    wishlist,
    orders,
    user,
    toasts,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    addOrder,
    adminUpdateOrderStatus,
    addProduct,
    deleteProduct,
    addReview,
    showToast,
    checkout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {/* Global Toast Layer */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[200] space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-5 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in slide-in-from-right-5 fade-in duration-300 ${
                t.type === "success"
                  ? "bg-secondary text-secondary-foreground"
                  : t.type === "error"
                  ? "bg-destructive text-white"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
