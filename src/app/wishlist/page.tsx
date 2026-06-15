"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, showToast } = useApp();

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-muted/50 border-b border-primary/10 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <span className="text-[9px] text-primary tracking-[0.25em] uppercase font-bold">Your Curation Atelier</span>
          <h1 className="font-serif text-2xl md:text-4xl text-secondary font-bold">Your Wishlist</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        {wishlist.length === 0 ? (
          <div className="py-24 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-muted-foreground font-light" />
            </div>
            <h3 className="font-serif text-lg text-secondary">Your wishlist is empty</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Discover Pinterest-perfect hand-blown drinkware pieces to fill your wishlist chest.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-secondary px-8 py-3 text-xs uppercase tracking-widest font-semibold text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300"
            >
              Shop Collections <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlist.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={product.id}
                  className="group bg-background border border-primary/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className={`aspect-square bg-gradient-to-tr ${product.gradientTheme} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-28 border-2 border-white/50 rounded-b-2xl bg-white/20 shadow-[0_8px_24px_rgba(255,255,255,0.45)] group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        toggleWishlist(product);
                        showToast(`Removed ${product.name} from wishlist.`);
                      }}
                      className="absolute top-3 right-3 p-2 bg-background/80 rounded-full shadow-sm text-red-500 hover:text-muted-foreground transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Context */}
                  <div className="p-4 space-y-2">
                    <span className="text-[9px] text-primary uppercase font-bold tracking-widest">{product.category}</span>
                    <h4 className="font-serif text-sm font-semibold text-secondary truncate">{product.name}</h4>
                    <span className="text-sm font-bold text-secondary block">₹{product.discountPrice || product.price}</span>

                    <button
                      onClick={() => {
                        addToCart(product, product.variants[0]?.title ?? '', 1);
                        showToast(`${product.name} added to cart!`);
                      }}
                      className="w-full py-2 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
