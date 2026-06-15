"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Sparkles, ShoppingBag, Plus, Trash2, ArrowUpRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { products, orders, addProduct, deleteProduct, adminUpdateOrderStatus, showToast } = useApp();

  // Add product form states
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdDiscount, setNewProdDiscount] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Glass tumblers");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdCapacity, setNewProdCapacity] = useState("");
  const [newProdGradient, setNewProdGradient] = useState("from-amber-100/50 to-orange-100/20");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      showToast("Please provide product name and base price details.", "error");
      return;
    }

    const priceNum = Number(newProdPrice);
    const discountNum = newProdDiscount ? Number(newProdDiscount) : undefined;

    addProduct({
      id: Date.now().toString(),
      name: newProdName,
      price: priceNum,
      discountPrice: discountNum,
      category: newProdCategory,
      description: newProdDesc || "Mouth-blown lead-free borosilicate drinkware built with classic artisanal precision.",
      capacity: newProdCapacity || "350ml",
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      variants: [{ id: 'set-of-2', title: 'Set of 2' }, { id: 'set-of-4', title: 'Set of 4' }],
      tags: ["new"],
      gradientTheme: newProdGradient,
    });

    showToast(`Successfully launched ${newProdName} inside catalog.`, "success");
    setNewProdName("");
    setNewProdPrice("");
    setNewProdDiscount("");
    setNewProdDesc("");
    setNewProdCapacity("");
  };

  // Calculations
  const ordersTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = ordersTotal + 45280; // Baseline simulated revenue + real orders

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-muted/50 border-b border-primary/10 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <span className="text-[9px] text-primary tracking-[0.25em] uppercase font-bold">Secure Command Center</span>
          <h1 className="font-serif text-2xl md:text-3xl text-secondary font-bold">Operational Backoffice</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12 text-left">
        
        {/* Sales metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-primary/10 rounded-2xl p-6 bg-background space-y-2 relative overflow-hidden">
            <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">Total Sales Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-secondary">₹{totalRevenue.toLocaleString("en-IN")}</span>
              <span className="text-green-600 text-[10px] font-bold inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +18.4%
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground font-light leading-relaxed">
              Includes ₹45,280 simulated baseline setup + real-time checked out orders.
            </p>
          </div>

          <div className="border border-primary/10 rounded-2xl p-6 bg-background space-y-2">
            <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">Active Shipments</span>
            <span className="font-serif text-2xl font-bold text-secondary">
              {orders.filter((o) => o.status !== "delivered").length} Pending
            </span>
            <p className="text-[9px] text-muted-foreground font-light leading-relaxed">
              Total orders placed under evaluation: {orders.length} orders.
            </p>
          </div>

          <div className="border border-primary/10 rounded-2xl p-6 bg-background space-y-2">
            <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">Artisan Catalog Range</span>
            <span className="font-serif text-2xl font-bold text-secondary">{products.length} Products</span>
            <p className="text-[9px] text-muted-foreground font-light leading-relaxed">
              Hand-blown lead-free borosilicate designs currently live on showcase.
            </p>
          </div>
        </div>

        {/* Milestone order list */}
        <div className="border border-primary/10 rounded-2xl bg-background overflow-hidden p-6 space-y-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Milestones Shipment Simulator</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-light">
              No orders have been checked out yet. Once a checkout is simulated, it will appear here for milestone updates.
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-light"
                >
                  <div className="space-y-1">
                    <span className="font-serif font-bold text-secondary block">{order.id}</span>
                    <span className="text-[9px] text-muted-foreground block truncate max-w-sm">
                      Deliver to: {order.address} | Total: <strong>₹{order.total}</strong> ({order.paymentMethod})
                    </span>
                  </div>

                  {/* Milestone steppers controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: "placed", label: "Placed" },
                      { key: "processing", label: "Processing" },
                      { key: "dispatched", label: "Dispatched" },
                      { key: "out_for_delivery", label: "Out" },
                      { key: "delivered", label: "Delivered" },
                    ].map((step) => {
                      const isActive = order.status === step.key;
                      return (
                        <button
                          key={step.key}
                          onClick={() => {
                            adminUpdateOrderStatus(order.id, step.key);
                            showToast(`Milestone updated to ${step.label} for order ${order.id}.`, "success");
                          }}
                          className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all border ${
                            isActive
                              ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                              : "border-primary/20 text-muted-foreground hover:border-primary/60"
                          }`}
                        >
                          {step.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Catalogs and launcher form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Launcher */}
          <div className="border border-primary/10 rounded-2xl bg-background p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">
              Launch Glassware Design
            </span>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                <input
                  type="text"
                  placeholder="E.g. Fluted Ribbed Tumbler"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-background border border-primary/20 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary text-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="1299"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-background border border-primary/20 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Discount Price</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={newProdDiscount}
                    onChange={(e) => setNewProdDiscount(e.target.value)}
                    className="w-full bg-background border border-primary/20 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-background border border-primary/20 text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-primary text-secondary"
                  >
                    <option value="Glass tumblers">Glass tumblers</option>
                    <option value="Wine glasses">Wine glasses</option>
                    <option value="Coffee mugs">Coffee mugs</option>
                    <option value="Drinkware gift sets">Drinkware gift sets</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Capacity</label>
                  <input
                    type="text"
                    placeholder="350ml"
                    value={newProdCapacity}
                    onChange={(e) => setNewProdCapacity(e.target.value)}
                    className="w-full bg-background border border-primary/20 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Gradient Theme</label>
                <select
                  value={newProdGradient}
                  onChange={(e) => setNewProdGradient(e.target.value)}
                  className="w-full bg-background border border-primary/20 text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-primary text-secondary"
                >
                  <option value="from-amber-100/50 to-orange-100/20">Pinterest Champagne Gold</option>
                  <option value="from-yellow-100/50 to-amber-100/20">24K Regal Yellow</option>
                  <option value="from-purple-100/40 to-pink-100/20">Aurora Iridescent</option>
                  <option value="from-sky-100/40 to-blue-100/20">Minimal Smoke Blue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  placeholder="Details..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-background border border-primary/20 text-xs p-3 rounded-lg focus:outline-none focus:border-primary text-secondary h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-secondary text-secondary-foreground text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-secondary transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Launch Design
              </button>
            </form>
          </div>

          {/* List catalog */}
          <div className="lg:col-span-2 border border-primary/10 rounded-2xl bg-background p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary block">
              Active Catalog Range ({products.length})
            </span>

            <div className="divide-y divide-primary/5">
              {products.map((prod) => (
                <div key={prod.id} className="py-4 flex justify-between items-center text-xs font-light">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className={`w-12 h-12 rounded bg-gradient-to-tr ${prod.gradientTheme} flex-shrink-0 flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover relative z-10" />
                      ) : (
                        <div className="w-4 h-8 border border-white/50 rounded-b bg-white/20" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-secondary block truncate">{prod.name}</span>
                      <span className="text-[9px] text-muted-foreground block">{prod.category} | {prod.capacity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-secondary">
                      ₹{prod.discountPrice || prod.price}
                    </span>
                    <button
                      onClick={() => {
                        deleteProduct(prod.id);
                        showToast(`Archived ${prod.name} catalog file.`, "success");
                      }}
                      className="text-muted-foreground hover:text-destructive p-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
