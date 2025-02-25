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
import { motion, AnimatePresence } from "framer-motion";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

export default function RegisterMood() {
  const [step, setStep] = useState(1);
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { teamEmotions, registerEmotion } = useEmotionRecordContext();
  const router = useRouter();

  const handleNextStep = () => {
    if (selectedMoodId !== null) {
      setError(null);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (selectedMoodId !== null) {
      try {
        setIsSubmitting(true);
        setError(null);
        await registerEmotion(selectedMoodId, intensity, description, isAnonymous);
        router.push("/home");
      } catch (error) {
        console.error("Erro ao registrar emoção:", error);
        setError("Ocorreu um erro ao registrar sua emoção. Tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-6">
          <Toaster position="bottom-right" richColors />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-6 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    {step === 1 ? "Como você está se sentindo hoje?" : "Detalhes do seu sentimento"}
                  </CardTitle>
                  {step === 1 && (
                    <p className="text-gray-600 text-center mt-2">
                      Selecione a emoção que melhor representa como você está se sentindo
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {step === 1 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                        <TooltipProvider>
                          {teamEmotions.map((emotion) => (
                            <Tooltip key={emotion.id}>
                              <TooltipTrigger asChild>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setSelectedMoodId(emotion.id)}
                                  className={`flex flex-col items-center justify-center p-4 rounded-full border w-24 h-24 md:w-28 md:h-28 transition-all ${
                                    selectedMoodId === emotion.id
                                      ? "border-2 shadow-lg"
                                      : "border-gray-300 hover:border-blue-500"
                                  }`}
                                  style={{
                                    backgroundColor: selectedMoodId === emotion.id ? `${emotion.color}20` : 'transparent',
                                    borderColor: selectedMoodId === emotion.id ? emotion.color : undefined
                                  }}
                                  aria-label={`Selecionar emoção ${emotion.name}`}
                                >
                                  <span className="text-3xl md:text-4xl" role="img" aria-label={emotion.name}>
                                    {emotion.emoji}
                                  </span>
                                  <span className="mt-2 text-xs md:text-sm font-medium">
                                    {emotion.name}
                                  </span>
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{`${emotion.name} - ${emotion.is_negative ? 'Emoção Negativa' : 'Emoção Positiva'}`}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>

                      {selectedMoodId && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 text-center"
                        >
                          <h3 className="text-lg font-semibold text-gray-700">
                            Qual a intensidade desse sentimento?
                          </h3>
                          <div className="flex items-center justify-center gap-4 mt-4">
                            <span className="text-sm text-gray-500">Fraco</span>
                            <Slider
                              defaultValue={[3]}
                              max={5}
                              step={1}
                              value={[intensity]}
                              onValueChange={(value) => setIntensity(value[0])}
                              className="w-64"
                              aria-label="Selecionar intensidade da emoção"
                            />
                            <span className="text-sm text-gray-500">Forte</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Nível selecionado: {intensity}/5
                          </p>
                        </motion.div>
                      )}

                      <div className="flex justify-end mt-6">
                        <Button
                          disabled={!selectedMoodId}
                          onClick={handleNextStep}
                          className="bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          Próximo
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Descreva um pouco mais sobre como você se sente... (opcional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px] resize-none"
                        aria-label="Descrição do sentimento"
                      />
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-gray-100 rounded-lg mt-4 hover:bg-gray-200 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {isAnonymous ? "Modo anônimo ativado" : "Modo anônimo desativado"}
                          </span>
                          <span className="text-sm text-gray-600">
                            {isAnonymous
                              ? "Seu nome não será exibido no registro"
                              : "Seu nome será exibido no registro"}
                          </span>
                        </div>
                        <Switch
                          checked={isAnonymous}
                          onCheckedChange={setIsAnonymous}
                          aria-label="Alternar modo anônimo"
                        />
                      </motion.div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-4"
                        >
                          {error}
                        </motion.p>
                      )}

                      <div className="flex justify-between mt-6">
                        <Button
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="hover:bg-gray-100 transition-colors"
                        >
                          Voltar
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            "Enviar"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
