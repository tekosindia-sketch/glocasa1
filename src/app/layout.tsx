import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GLOCASA | Premium Glassware & Drinkware | Modern Indian Luxury",
  description: "Experience Apple-style luxury drinkware. Shop premium ribbed tumblers, café-aesthetic coffee mugs, and imperial gold crystal wine glasses. Made for aesthetic homes.",
  keywords: "premium glassware India, D2C drinkware, gold rimmed tumblers, aesthetic coffee mugs, wine glasses online, aesthetic kitchenware, GLOCASA, Indian home decor",
  authors: [{ name: "GLOCASA Luxury" }],
  openGraph: {
    title: "GLOCASA | Premium Glassware & Drinkware | Modern Indian Luxury",
    description: "Shop premium ribbed tumblers, café-aesthetic coffee mugs, and imperial gold crystal wine glasses. Crafted for aesthetic homes.",
    url: "https://glocasa.in",
    siteName: "GLOCASA Glassware",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        {/* Inline script runs before any module JS, so registers before Next.js dev overlay */}
        <script dangerouslySetInnerHTML={{__html:`(function(){function s(v){if(!v)return false;var m=v.message||'',t=v.stack||'';return v.name==='AbortError'||/aborted a request/i.test(m)||/chrome-extension:\\/\\//i.test(t)||/client is offline/i.test(m)||/\\[code=unavailable\\]/i.test(m)||/Could not reach Cloud Firestore/i.test(m);}window.addEventListener('error',function(e){if(s(e.error)||/aborted a request/i.test(e.message||'')){e.preventDefault();e.stopImmediatePropagation();}},true);window.addEventListener('unhandledrejection',function(e){if(s(e.reason)){e.preventDefault();e.stopImmediatePropagation();}},true);})();`}} />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
