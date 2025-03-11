"use client";

import { useState } from "react";
import { mockEmotions } from "@/mocks/emotions";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/sidebar";

export default function EmotionsDemo() {
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");

  const filteredEmotions = mockEmotions.filter((emotion) => {
    if (filter === "all") return true;
    if (filter === "positive") return !emotion.is_negative && emotion.name !== "Neutro";
    if (filter === "negative") return emotion.is_negative;
    if (filter === "neutral") return !emotion.is_negative && ["Neutro", "Pensativo", "Curioso", "Concentrado"].includes(emotion.name);
    return true;
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demonstração de Emoções</h1>
          </div>

          {/* Filtro de Emoções */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Filtrar Emoções</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                Todas ({mockEmotions.length})
              </Button>
              <Button
                variant={filter === "positive" ? "default" : "outline"}
                onClick={() => setFilter("positive")}
                className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
              >
                Positivas ({mockEmotions.filter((e) => !e.is_negative && e.name !== "Neutro").length})
              </Button>
              <Button
                variant={filter === "neutral" ? "default" : "outline"}
                onClick={() => setFilter("neutral")}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
              >
                Neutras (4)
              </Button>
              <Button
                variant={filter === "negative" ? "default" : "outline"}
                onClick={() => setFilter("negative")}
                className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
              >
                Negativas ({mockEmotions.filter((e) => e.is_negative).length})
              </Button>
            </div>
          </div>

          {/* Exibição de Emoções */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEmotions.map((emotion, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex items-center gap-3 transition-all hover:shadow-md"
                style={{
                  borderColor: emotion.color,
                  backgroundColor: `${emotion.color}15`
                }}
              >
                <span className="text-3xl">{emotion.emoji}</span>
                <div>
                  <p className="font-medium">{emotion.name}</p>
                  <p className="text-xs" style={{ color: emotion.color }}>
                    {emotion.is_negative ? "Emoção Negativa" : 
                      ["Neutro", "Pensativo", "Curioso", "Concentrado"].includes(emotion.name) ? 
                      "Emoção Neutra" : "Emoção Positiva"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Informações do Mock */}
         
        </div>
      </div>
    </div>
  );
}
