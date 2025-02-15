"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Mock de emoções (substituir com API futuramente)
const mockEmotions = [
  { id: 1, emoji: "😃", label: "Feliz" },
  { id: 2, emoji: "😐", label: "Neutro" },
  { id: 3, emoji: "😢", label: "Triste" },
  { id: 4, emoji: "😠", label: "Frustrado" },
  { id: 5, emoji: "😰", label: "Ansioso" },
  { id: 6, emoji: "🚀", label: "Motivado" },
];

export default function RegisterMood() {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<{ id: number; emoji: string; label: string } | null>(null);
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const router = useRouter();

  // Avançar para o próximo passo
  const handleNextStep = () => {
    if (selectedMood) setStep(2);
  };

  // Enviar feedback
  const handleSubmit = () => {
    const payload = {
      mood: selectedMood,
      description,
      isAnonymous,
    };
    console.log("Dados enviados:", payload);
    // Aqui poderia ser feita uma requisição para a API

    // Redirecionar para a home após o envio
    router.push("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-2xl p-6 shadow-lg">
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Como você está se sentindo hoje?" : "Descreva melhor seu sentimento"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            // **Passo 1: Escolha de Emoção**
            <div className="flex justify-center gap-6">
              {mockEmotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedMood(emotion)}
                  className={`flex flex-col items-center justify-center p-4 rounded-full border ${
                    selectedMood?.id === emotion.id ? "border-blue-600" : "border-gray-300"
                  } hover:border-blue-500 transition`}
                >
                  <span className="text-4xl">{emotion.emoji}</span>
                  <span className="mt-2 text-sm">{emotion.label}</span>
                </button>
              ))}
            </div>
          ) : (
            // **Passo 2: Comentário e Modo Anônimo**
            <div className="space-y-4">
              <Textarea
                placeholder="Escreva um pouco mais sobre como você se sente..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex items-center justify-between p-3 bg-gray-200 rounded-lg">
                <span>{isAnonymous ? "Modo anônimo ativado" : "Modo anônimo desativado"}</span>
                <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              </div>
            </div>
          )}
        </CardContent>

        {/* Botão para avançar ou enviar */}
        <div className="flex justify-end mt-4">
          {step === 1 ? (
            <Button disabled={!selectedMood} onClick={handleNextStep} className="bg-blue-600">
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600">
              Enviar
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
