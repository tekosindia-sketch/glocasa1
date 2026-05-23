"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Star, Heart, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function ShopContent() {
  const searchParams = useSearchParams();
  const { products, addToCart, toggleWishlist, wishlist, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState(3500);

  const allCategories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesPrice = (p.discountPrice || p.price) <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <section className="bg-muted/50 border-b border-primary/10 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <span className="text-[9px] text-primary tracking-[0.25em] uppercase font-bold">Premium Curation</span>
          <h1 className="font-serif text-2xl md:text-4xl text-secondary font-bold">The Atelier Shop</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search glassware..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-primary/20 text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary text-secondary"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border rounded-full transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "border-primary/20 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 border rounded cursor-pointer ${
                viewMode === "grid" ? "border-primary text-primary" : "border-primary/20 text-muted-foreground"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 border rounded cursor-pointer ${
                viewMode === "list" ? "border-primary text-primary" : "border-primary/20 text-muted-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget slider */}
        <div className="flex items-center gap-4 mb-8 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground font-light">Budget:</span>
          <input
            type="range"
            min={350}
            max={3500}
            step={50}
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="flex-1 max-w-xs accent-primary"
          />
          <span className="font-bold text-secondary">Up to ₹{priceRange}</span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center text-xs text-muted-foreground">
            No products match your filters. Try adjusting your search or budget.
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
            {filteredProducts.map((product, idx) => {
              const isWished = wishlist.some((w) => String(w.id) === String(product.id));
              if (viewMode === "list") {
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4 border border-primary/10 rounded-xl p-4 bg-background hover:border-primary/30 transition-all text-left"
                  >
                    <Link
                      href={`/product/${product.id}`}
                      className={`w-24 h-24 rounded bg-gradient-to-tr ${product.gradientTheme} flex-shrink-0 flex items-center justify-center relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover relative z-10" />
                      ) : (
                        <div className="w-6 h-12 border border-white/50 rounded-b-md bg-white/20 shadow-[0_4px_12px_rgba(255,255,255,0.4)]" />
                      )}
                    </Link>
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] text-primary uppercase font-bold tracking-widest">{product.category}</span>
                      <Link
                        href={`/product/${product.id}`}
                        className="block font-serif text-sm font-semibold text-secondary hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[10px] text-muted-foreground font-light line-clamp-1">{product.description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-secondary">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">₹{product.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end justify-center">
                      <button
                        onClick={() => {
                          addToCart(product, product.variants[0].id, 1);
                          showToast(`${product.name} added!`);
                        }}
                        className="px-4 py-2 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-all cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`p-1.5 cursor-pointer ${isWished ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-background border border-primary/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 text-left"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className={`block aspect-square bg-gradient-to-tr ${product.gradientTheme} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-28 border-2 border-white/50 rounded-b-2xl bg-white/20 shadow-[0_8px_24px_rgba(255,255,255,0.45)] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    {product.discountPrice && (
                      <span className="absolute top-3 left-3 bg-destructive text-white text-[8px] font-bold px-2 py-1 rounded uppercase">
                        Sale
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-3 right-3 p-2 bg-background/80 rounded-full shadow-sm cursor-pointer z-10 ${
                        isWished ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
                    </button>
                  </Link>
                  <div className="p-4 space-y-2">
                    <span className="text-[9px] text-primary uppercase font-bold tracking-widest">{product.category}</span>
                    <Link
                      href={`/product/${product.id}`}
                      className="block font-serif text-sm font-semibold text-secondary hover:text-primary transition-colors leading-snug"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-current" : ""}`} />
                      ))}
                      <span className="text-muted-foreground ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-secondary">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">₹{product.price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        addToCart(product, product.variants[0], 1);
                        showToast(`${product.name} added to cart!`);
                      }}
                      className="w-full py-2 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-all cursor-pointer mt-1"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
