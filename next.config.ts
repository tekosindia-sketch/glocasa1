import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict Mode double-invokes effects in dev, which mounts→unmounts→mounts the
  // Firebase sync component. That spurious unmount aborts the live Firestore
  // listener and pops a benign "AbortError" in the dev overlay. Disabling it
  // makes dev match production behavior (prod never double-invokes effects).
  reactStrictMode: false,
};

export default nextConfig;
