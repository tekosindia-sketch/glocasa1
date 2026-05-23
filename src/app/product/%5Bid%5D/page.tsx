"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, ShoppingBag, ArrowLeft, Star, ShieldAlert, Award, Sparkles, RefreshCw } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { products, addToCart, toggleWishlist, wishlist, showToast } = useApp();

  const productId = params?.id ? decodeURIComponent(params.id as string) : "";
  const product = products.find((p) => String(p.id).split("/").pop() === productId || String(p.id) === productId);

  const [selectedVariant, setSelectedVariant] = useState<string>("");
  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Initialize with the first variant's ID
      setSelectedVariant(product.variants[0].id);
    }
  }, [product]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "care" | "shipping">("desc");

// Removed duplicate useEffect that set selectedVariant to an object; now using ID string

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-24">
          <h3 className="font-serif text-lg text-secondary">Glassware curation not found</h3>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-colors cursor-pointer"
          >
            Return to Shop
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const isFavorited = wishlist.some((p) => String(p.id) === String(product.id));

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    showToast(`Added ${quantity}x ${product.name} (${selectedVariant}) to cart!`, "success");
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8 text-left">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors cursor-pointer uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to curations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Premium Glass visual */}
          <div className="space-y-4">
            <div className={`aspect-square rounded-3xl bg-gradient-to-tr ${product.gradientTheme} flex items-center justify-center relative overflow-hidden shadow-sm`}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover relative z-10" />
              ) : (
                <div className="w-24 h-48 border-4 border-white/50 rounded-b-3xl bg-white/20 relative shadow-[0_16px_48px_rgba(255,255,255,0.5)] flex items-end p-4">
                  <div className="w-full bg-white/10 h-1/4 rounded-b-2xl animate-pulse" />
                </div>
              )}

              {/* Badges */}
              {product.tags.includes("bestseller") && (
                <span className="absolute top-4 left-4 bg-primary text-secondary-foreground text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest rounded shadow-sm">
                  Atelier Bestseller
                </span>
              )}
              {product.tags.includes("new") && (
                <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest rounded shadow-sm">
                  New curation
                </span>
              )}
            </div>
          </div>

          {/* Right: Meta actions */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] text-primary tracking-[0.25em] uppercase font-bold block">{product.category}</span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-secondary">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-secondary font-semibold">{product.rating}</span>
                <span className="text-muted-foreground font-light">({product.reviewCount || 14} verified reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl font-bold text-secondary">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-secondary block">Select Package Curation</span>
              <div className="flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`px-4 py-2 border rounded-xl text-xs tracking-wider transition-all cursor-pointer ${
                      selectedVariant === v.id
                        ? "border-primary bg-primary/5 text-secondary font-bold"
                        : "border-primary/25 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="flex gap-4 items-center pt-2">
              <div className="flex items-center border border-primary/25 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-xs font-bold text-muted-foreground hover:text-secondary cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-secondary">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-xs font-bold text-muted-foreground hover:text-secondary cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-secondary text-secondary-foreground text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-md"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product);
                  showToast(isFavorited ? `Removed ${product.name} from wishlist.` : `Added ${product.name} to wishlist!`);
                }}
                className={`p-3 border rounded-xl transition-all cursor-pointer ${
                  isFavorited
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-primary/25 text-muted-foreground hover:text-secondary"
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Premium trust blocks */}
            <div className="grid grid-cols-2 gap-4 border-t border-primary/10 pt-6">
              <div className="flex gap-2.5 items-start">
                <ShieldAlert className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-[10px] text-muted-foreground font-light leading-normal">
                  <strong className="text-secondary block font-bold uppercase tracking-wider mb-0.5">Lead-Free Pureness</strong>
                  Mouth-blown 100% premium borosilicate.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <Award className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-[10px] text-muted-foreground font-light leading-normal">
                  <strong className="text-secondary block font-bold uppercase tracking-wider mb-0.5">24K Gold Liquid</strong>
                  Complimentary genuine hand-gilded gold rims.
                </div>
              </div>
            </div>

            {/* Informational Tabs */}
            <div className="border border-primary/10 rounded-2xl overflow-hidden bg-background">
              <div className="flex border-b border-primary/10 bg-muted/40">
                {[
                  { id: "desc", label: "Spec sheet" },
                  { id: "care", label: "Care guide" },
                  { id: "shipping", label: "Delhivery terms" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex-1 py-2.5 text-[9px] uppercase tracking-widest font-bold text-center border-r last:border-r-0 border-primary/10 cursor-pointer transition-colors ${
                      activeTab === t.id ? "bg-background text-secondary" : "text-muted-foreground hover:bg-background/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4 text-[10px] text-muted-foreground font-light leading-relaxed">
                {activeTab === "desc" && (
                  <div className="space-y-1.5">
                    <p>{product.description}</p>
                    <p>• <strong>Capacity:</strong> {product.capacity}</p>
                    <p>• <strong>Material:</strong> Lead-free premium borosilicate glass</p>
                    <p>• <strong>Resistance:</strong> Safe between -20°C and 150°C</p>
                  </div>
                )}
                {activeTab === "care" && (
                  <p>
                    While our glassware tolerates high microwave heat, we recommend hand washing items with mild dishwash liquid using gentle sponge strokes to protect the hand-painted 24K gold rims. Avoid metal scrubbing pads.
                  </p>
                )}
                {activeTab === "shipping" && (
                  <p>
                    Delhivery surface courier is complimentary on cart ranges over ₹1,499 (otherwise flat ₹150 applies). Complimentary Blue Dart Express Air upgrades are activated automatically on order totals over ₹1,499.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
