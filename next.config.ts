import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["api.dicebear.com","api.multiavatar.com"], // Permite carregar imagens do DiceBear
  },
};

export default nextConfig;
