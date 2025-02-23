"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Info } from "lucide-react";


export default function NoTeamAlert() {


  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10">
      {/* 🚨 Alerta principal */}
      <Alert variant="default" className="bg-yellow-50 border-yellow-300 w-full max-w-3xl shadow-md">
        <div className="flex items-center justify-center gap-4">
          <Info className="h-8 w-8 text-yellow-500" />
          <div>
            <AlertTitle className="text-xl font-semibold text-yellow-700">
              🚨 Você ainda não faz parte de um time!
            </AlertTitle>
            <AlertDescription className="text-gray-600 text-sm">
              A colaboração em equipe é essencial para o crescimento em ambientes ágeis.
              <br />
              Converse com seu gerente para participar de um time e desbloquear recursos valiosos! 🚀
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* 🌟 Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[
          {
            title: "🌈 Ambiente Seguro",
            description:
              "Em times ágeis, um ambiente psicologicamente seguro impulsiona inovação e confiança. Compartilhe suas emoções e fortaleça a equipe.",
          },
          {
            title: "💬 Comunicação Transparente",
            description:
              "Monitorar emoções permite identificar e solucionar problemas rapidamente, promovendo feedbacks construtivos e comunicação clara.",
          },
          {
            title: "📊 Insights Emocionais",
            description:
              "Acompanhe o clima emocional do time e implemente estratégias para um ambiente mais colaborativo e produtivo.",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-xl transition-transform hover:scale-105"
          >
            <h3 className="text-lg font-semibold text-blue-700 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
