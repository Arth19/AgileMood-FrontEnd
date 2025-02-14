// src/app/home/page.tsx
import Sidebar from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold">Bem-vindo ao Dashboard</h1>
        <p className="mt-2 text-gray-600">Aqui é sua tela inicial.</p>
      </div>
    </div>
  );
}
