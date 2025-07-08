import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Desativa os alertas de erro na tela
  onDemandEntries: {
    // Período em ms em que a página será mantida em buffer
    maxInactiveAge: 25 * 1000,
    // Número de páginas que serão mantidas em buffer
    pagesBufferLength: 2,
  },
  // Desativa os erros de hidratação React
  reactStrictMode: false,
  // Permite que a build em produção conclua mesmo se houver erros de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Se quiser também ignorar erros de TypeScript na build, descomente a linha abaixo:
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
