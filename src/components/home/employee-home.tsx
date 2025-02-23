 
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEmotionRecordContext } from "@/contexts/emotion-record-context";

export default function EmployeeHome() {
  const router = useRouter();
  const { emotionRecords, loading, getEmotionDetails } = useEmotionRecordContext();

  const handleAddEntry = () => {
    router.push("/register-mood");
  };

  return (
    <>
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
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        Carregando histórico...
                      </td>
                    </tr>
                  ) : emotionRecords.length > 0 ? (
                    emotionRecords.map((entry, index) => {
                      const emotion = getEmotionDetails(entry.emotion_id);
                      return (
                        <tr key={index} className="text-center">
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white`}
                              style={{ backgroundColor: emotion?.color || "#D1D5DB" }}
                            >
                              {emotion?.emoji} {emotion?.name || "Desconhecido"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{entry.notes}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">
                            {entry.is_anonymous ? "Anônimo" : "Você"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
