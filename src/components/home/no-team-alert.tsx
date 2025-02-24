"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface InfoCard {
  title: string;
  description: string;
}

const INFO_CARDS: InfoCard[] = [
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
];

const InfoCardComponent = ({ title, description }: InfoCard) => (
  <div
    className="group bg-white rounded-lg shadow-md p-6 text-center border border-gray-200 
    hover:shadow-xl transition-all duration-300 hover:scale-102 hover:border-blue-300
    motion-safe:animate-fadeIn"
    role="article"
    aria-label={`Card informativo: ${title}`}
  >
    <h3 className="text-lg font-semibold text-blue-700 mb-3 group-hover:text-blue-800 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default function NoTeamAlert() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 w-full max-w-7xl mx-auto px-4">
      {/* 🚨 Alerta principal */}
      <Alert 
        variant="default" 
        className="bg-yellow-50/90 backdrop-blur-sm border-yellow-300 w-full max-w-3xl shadow-lg 
        hover:shadow-xl transition-all duration-300 motion-safe:animate-slideDown"
        role="alert"
      >
        <div className="flex items-center justify-center gap-4">
          <Info className="h-8 w-8 text-yellow-500 animate-pulse" />
          <div>
            <AlertTitle className="text-xl font-semibold text-yellow-700 mb-2">
              🚨 Você ainda não faz parte de um time!
            </AlertTitle>
            <AlertDescription className="text-gray-600 text-base">
              A colaboração em equipe é essencial para o crescimento em ambientes ágeis.
              <br />
              <span className="font-medium">
                Converse com seu gerente para participar de um time e desbloquear recursos valiosos! 
              </span>
              <span className="inline-block animate-bounce">🚀</span>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* 🌟 Cards informativos */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        role="region"
        aria-label="Informações importantes sobre times ágeis"
      >
        {INFO_CARDS.map((card) => (
          <InfoCardComponent key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
