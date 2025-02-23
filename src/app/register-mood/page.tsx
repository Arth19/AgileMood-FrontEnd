"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useEmotionRecordContext } from "@/contexts/emotion-record-context";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/ui/protected-route";

export default function RegisterMood() {
  const [step, setStep] = useState(1);
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { teamEmotions, registerEmotion } = useEmotionRecordContext();
  const router = useRouter();

  const handleNextStep = () => {
    if (selectedMoodId !== null) setStep(2);
  };

  const handleSubmit = async () => {
    if (selectedMoodId !== null) {
      await registerEmotion(selectedMoodId, intensity, description, isAnonymous);
      router.push("/home");
    }
  };

  return (
    <ProtectedRoute>
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-6">
        <Toaster position="bottom-right" richColors />
        <Card className="w-full max-w-2xl p-6 shadow-lg">
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Como você está se sentindo hoje?" : "Detalhes do seu sentimento (Opcional)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <>
                <div className="flex justify-center gap-6 flex-wrap">
                  {teamEmotions.map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedMoodId(emotion.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-full border w-28 h-28 transition ${
                        selectedMoodId === emotion.id
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      <span className="text-4xl">{emotion.emoji}</span>
                      <span className="mt-2 text-sm">{emotion.name}</span>
                    </button>
                  ))}
                </div>

                {selectedMoodId && (
                  <div className="mt-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Qual a intensidade desse sentimento? ({intensity}/5)
                    </h3>
                    <Slider
                      defaultValue={[3]}
                      max={5}
                      step={1}
                      onValueChange={(value) => setIntensity(value[0])}
                      className="mt-4"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      1 (baixa intensidade) — 5 (intensidade alta)
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button disabled={!selectedMoodId} onClick={handleNextStep} className="bg-blue-600">
                    Próximo
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Textarea
                  placeholder="Descreva um pouco mais sobre como você se sente..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex items-center justify-between p-3 bg-gray-200 rounded-lg mt-4">
                  <span>{isAnonymous ? "Modo anônimo ativado" : "Modo anônimo desativado"}</span>
                  <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                </div>

                <div className="flex justify-between mt-6">
                  <Button onClick={() => setStep(1)} variant="outline">
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Enviar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}
