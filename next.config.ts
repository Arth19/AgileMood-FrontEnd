import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["api.dicebear.com","api.multiavatar.com"], // Permite carregar imagens do DiceBear
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*', // Backend FastAPI
      },
    ];
  },
};

export default nextConfig;
