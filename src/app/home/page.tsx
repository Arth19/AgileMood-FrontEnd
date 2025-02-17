
"use client"

import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function HomePage() {
  const router = useRouter(); // Hook para navegação
  const [history, setHistory] = useState<
    { date: string; mood: string; comment: string; isAnonymous: boolean }[]
  >([]);
  useEffect(() => {
    setTimeout(() => {
      setHistory(mockHistory);
    }, 1000);
  }, []);

  const mockHistory = [
    { date: "31/12/2022", mood: "Feliz", comment: "Hoje foi um dia incrível!", isAnonymous: true },
    { date: "30/12/2022", mood: "Neutro", comment: "Nada demais aconteceu.", isAnonymous: false },
    { date: "29/12/2022", mood: "Triste", comment: "Me senti um pouco desmotivado.", isAnonymous: true },
    { date: "28/12/2022", mood: "Motivado", comment: "Consegui cumprir todas as metas do dia!", isAnonymous: false },
    { date: "27/12/2022", mood: "Ansioso", comment: "Muitas coisas acontecendo ao mesmo tempo.", isAnonymous: true },
    { date: "26/12/2022", mood: "Frustrado", comment: "Tive alguns desafios difíceis.", isAnonymous: false },
  ];
  const handleAddEntry = () => {
    router.push("/register-mood"); // Redireciona para a página de registro de emoção
  };
  
  return (
    <div className="flex h-screen">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold">Olá! Como você está hoje?</h1>
        <p className="mt-2 text-gray-600">Registre suas emoções e acompanhe seu histórico.</p>

        {/* Seção de Registro */}
        <div className="mt-6">
          <Card className="p-6 shadow-lg">
            <CardHeader>
              <CardTitle>Registrar Emoção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Registre como você está se sentindo para acompanhar seu bem-estar ao longo do tempo.
              </p>
              <Button onClick={handleAddEntry} className="bg-blue-600 hover:bg-blue-700">
                Registrar Agora
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Histórico */}
          {/* Seção de Histórico */}
          <div className="mt-8">
          <Card className="p-6 shadow-lg">
            <CardHeader>
              <CardTitle>Histórico de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Data</th>
                      <th className="border border-gray-300 px-4 py-2">Emoção</th>
                      <th className="border border-gray-300 px-4 py-2">Comentário</th>
                      <th className="border border-gray-300 px-4 py-2">Autor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((entry, index) => (
                        <tr key={index} className="text-center">
                          <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span className="bg-gray-200 px-2 py-1 rounded">{entry.mood}</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{entry.comment}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">
                            {entry.isAnonymous ? "Anônimo" : "Usuário"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">
                          Carregando histórico...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
