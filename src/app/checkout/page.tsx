"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, checkout, showToast } = useApp();
  const [status, setStatus] = useState<"redirecting" | "error">("redirecting");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
      return;
    }

    // Immediately trigger Shopify checkout redirect
    checkout()
      .then(() => {
        // checkout() already calls window.location.href so we just wait
      })
      .catch((e: any) => {
        console.error("Shopify checkout failed:", e);
        setErrorMsg(e?.message || "Unable to connect to Shopify. Please try again.");
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {status === "redirecting" ? (
          <div className="flex flex-col items-center gap-8 text-center max-w-sm">
            {/* Animated logo spinner */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
              <div className="absolute inset-3 rounded-full border-t-2 border-primary/50 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-primary font-bold text-sm tracking-widest">G</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-primary tracking-[0.3em] uppercase font-bold animate-pulse">
                Securing your order
              </p>
              <h1 className="font-serif text-2xl text-secondary font-bold">
                Redirecting to Shopify
              </h1>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                You are being securely transferred to Shopify Checkout.<br />
                Please do not refresh this page.
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-0.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[progressBar_2s_ease-in-out_infinite]" />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-light">
              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              256-bit SSL encrypted · Powered by Shopify
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-xl text-secondary font-bold">Checkout Failed</h2>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStatus("redirecting");
                  setErrorMsg("");
                  checkout().catch((e: any) => {
                    setErrorMsg(e?.message || "Please try again.");
                    setStatus("error");
                  });
                }}
                className="px-6 py-2.5 bg-primary text-secondary-foreground text-xs uppercase tracking-widest font-bold hover:bg-accent transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/cart")}
                className="px-6 py-2.5 border border-primary/30 text-secondary text-xs uppercase tracking-widest font-bold hover:border-primary transition-colors cursor-pointer"
              >
                Back to Cart
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes progressBar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 100%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </main>
  );
}
