"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Star, Truck, ShieldCheck, RotateCcw, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { products, addToCart, toggleWishlist, wishlist, showToast } = useApp();
  const bestsellers = products.filter((p) => p.tags.includes("bestseller") || p.rating >= 4.8).slice(0, 4);
  const categories = [
    { name: "Ribbed Tumblers", href: "/shop?category=Glass%20tumblers", gradient: "from-amber-100/50 to-orange-100/20" },
    { name: "Wine Goblets", href: "/shop?category=Wine%20glasses", gradient: "from-yellow-100/50 to-amber-100/20" },
    { name: "Coffee Mugs", href: "/shop?category=Coffee%20mugs", gradient: "from-orange-100/40 to-red-100/20" },
    { name: "Gift Sets", href: "/shop?category=Drinkware%20gift%20sets", gradient: "from-stone-200/50 to-orange-100/20" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden animated-luxury-gradient py-24 md:py-36 border-b border-primary/10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-[10px] text-primary tracking-[0.3em] uppercase font-bold">Firozabad Artisan Crafted</span>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-secondary font-bold leading-tight mt-2">Where Light Meets<br /><span className="text-primary">Liquid Gold</span></h1>
            <p className="text-sm md:text-base text-muted-foreground font-light max-w-xl mx-auto mt-4 leading-relaxed">Premium hand-blown borosilicate glassware with 24K gold accents. Designed for the modern Indian home aesthetic.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/shop" className="px-10 py-4 bg-secondary text-secondary-foreground text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-all duration-300 shadow-lg inline-flex items-center gap-2">
              Shop The Atelier <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/collections" className="px-10 py-4 border border-secondary text-secondary text-xs uppercase tracking-widest font-bold hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              View Collections
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-primary/10 py-6 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, label: "Easy Shipping", sub: "Free over ₹1,499" },
            { icon: ShieldCheck, label: "Lead-Free Glass", sub: "100% Borosilicate" },
            { icon: RotateCcw, label: "10 Day Return", sub: "Fragile insurance" },
            { icon: Star, label: "4.8★ Rated", sub: "500+ Happy homes" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-3 justify-center text-center">
              <t.icon className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">{t.label}</span>
                <span className="text-[9px] text-muted-foreground font-light">{t.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[9px] text-primary uppercase font-bold tracking-[0.2em]">Curated Selections</span>
          <h2 className="font-serif text-2xl md:text-4xl text-secondary font-bold">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
              <Link href={cat.href} className={`block aspect-square rounded-2xl bg-gradient-to-tr ${cat.gradient} relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-20 border border-white/50 rounded-b-xl bg-white/20 shadow-[0_6px_16px_rgba(255,255,255,0.4)] mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">{cat.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bg-muted/30 border-y border-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] text-primary uppercase font-bold tracking-[0.2em]">Most Loved</span>
              <h2 className="font-serif text-2xl md:text-3xl text-secondary font-bold">Bestsellers</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product, idx) => {
              const isWished = wishlist.some((w) => String(w.id) === String(product.id));
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="group bg-background border border-primary/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link href={`/product/${product.id}`} className={`block aspect-square bg-gradient-to-tr ${product.gradientTheme} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-28 border-2 border-white/50 rounded-b-2xl bg-white/20 shadow-[0_8px_24px_rgba(255,255,255,0.45)] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    {product.discountPrice && <span className="absolute top-3 left-3 bg-destructive text-white text-[8px] font-bold px-2 py-1 rounded uppercase">Sale</span>}
                  </Link>
                  <div className="p-4 space-y-2">
                    <span className="text-[9px] text-primary uppercase font-bold tracking-widest">{product.category}</span>
                    <Link href={`/product/${product.id}`} className="block font-serif text-sm font-semibold text-secondary hover:text-primary transition-colors leading-snug">{product.name}</Link>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-current" : ""}`} />))}
                      <span className="text-muted-foreground ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-secondary">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && <span className="text-[10px] text-muted-foreground line-through">₹{product.price}</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { addToCart(product, product.variants[0].id, 1); showToast(`${product.name} added to cart!`); }} className="flex-1 py-2 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-all cursor-pointer">Add to Cart</button>
                      <button onClick={() => toggleWishlist(product)} className={`p-2 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer ${isWished ? "text-red-500" : "text-muted-foreground"}`}><Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex-1 space-y-4 relative z-10">
            <span className="text-[9px] text-primary uppercase font-bold tracking-[0.2em]">Luxury Gifting Season</span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight">Gift the art of glass.<br />Save up to ₹500.</h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-md">Use code <strong className="text-primary">GLO200</strong> for ₹200 off orders above ₹899 or <strong className="text-primary">FESTIVE15</strong> for 15% off above ₹1,499.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-secondary-foreground text-xs uppercase tracking-widest font-bold hover:bg-accent transition-colors shadow">Shop Gifts <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-amber-100/20 to-yellow-100/10 flex items-center justify-center relative z-10">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
