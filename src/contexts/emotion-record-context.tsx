"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth-context";

interface Emotion {
  id: number;
  name: string;
  emoji: string;
  color: string;
  team_id: number;
  is_negative: boolean;
}

interface EmotionRecord {
  id: number;
  user_id: number;
  emotion_id: number;
  intensity: number;
  notes: string;
  is_anonymous: boolean;
  created_at: string;
}

interface EmotionRecordContextProps {
  emotions: Emotion[];
  emotionRecords: EmotionRecord[];
  teamEmotions: Emotion[];
  loading: boolean;
  fetchEmotions: () => Promise<void>;
  fetchEmotionRecords: () => Promise<void>;
  fetchTeamEmotions: () => Promise<void>;
  registerEmotion: (
    emotionId: number,
    intensity: number,
    notes: string,
    isAnonymous: boolean
  ) => Promise<void>;
  getEmotionDetails: (emotionId: number) => Emotion | undefined;
}

// 🌟 **Mock de Emoções**
const mockEmotions: Emotion[] = [
  { id: 1, name: "Feliz", emoji: "😃", color: "#FFD700", team_id: 1, is_negative: false },
  { id: 2, name: "Neutro", emoji: "😐", color: "#A9A9A9", team_id: 1, is_negative: false },
  { id: 3, name: "Triste", emoji: "😢", color: "#87CEEB", team_id: 1, is_negative: true },
  { id: 4, name: "Frustrado", emoji: "😠", color: "#FF6347", team_id: 1, is_negative: true },
  { id: 5, name: "Ansioso", emoji: "😰", color: "#FFA500", team_id: 1, is_negative: true },
  { id: 6, name: "Motivado", emoji: "🚀", color: "#32CD32", team_id: 1, is_negative: false },
];

// 🌟 **Mock de Registros de Emoção**
const mockEmotionRecords: EmotionRecord[] = [
  {
    user_id: 1,
    emotion_id: 1,
    intensity: 4,
    notes: "Dia super produtivo!",
    is_anonymous: false,
    id: 101,
    created_at: "2025-02-23T10:00:00.000Z",
  },
  {
    user_id: 1,
    emotion_id: 3,
    intensity: 2,
    notes: "Me senti desmotivado pela manhã.",
    is_anonymous: true,
    id: 102,
    created_at: "2025-02-22T14:30:00.000Z",
  },
];

const EmotionRecordContext = createContext<EmotionRecordContextProps | undefined>(undefined);

export const EmotionRecordProvider = ({ children }: { children: ReactNode }) => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [teamEmotions, setTeamEmotions] = useState<Emotion[]>([]);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthContext();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchEmotions = async () => {
    try {
      const response = await fetch(`${API_URL}/emotion/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmotions(data.emotions.length ? data.emotions : mockEmotions);
        if (data.emotions.length === 0) toast.info("⚡ Exibindo emoções de exemplo.");
      } else {
        setEmotions(mockEmotions);
        toast.error("⚠️ Erro ao carregar emoções. Exibindo mock.");
      }
    } catch (error) {
      console.error("Erro ao buscar emoções:", error);
      setEmotions(mockEmotions);
      toast.error("⚠️ Erro inesperado. Exibindo mock.");
    }
  };

  const fetchEmotionRecords = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/emotion_record/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmotionRecords(data.emotion_records.length ? data.emotion_records : mockEmotionRecords);
        if (data.emotion_records.length === 0) toast.info("📚 Exibindo registros de exemplo.");
      } else {
        setEmotionRecords(mockEmotionRecords);
        toast.error("⚠️ Erro ao carregar o histórico. Exibindo mock.");
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setEmotionRecords(mockEmotionRecords);
      toast.error("⚠️ Erro inesperado ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamEmotions = async () => {
    if (!user?.team_id) return;
    try {
      const response = await fetch(`${API_URL}/teams/${user.team_id}/emotions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTeamEmotions(data.emotions.length ? data.emotions : mockEmotions);
        if (data.emotions.length === 0) toast.info("⚡ Exibindo emoções do time (mock).");
      } else {
        setTeamEmotions(mockEmotions);
        toast.error("⚠️ Erro ao carregar as emoções do time. Exibindo mock.");
      }
    } catch (error) {
      console.error("Erro ao buscar emoções do time:", error);
      setTeamEmotions(mockEmotions);
      toast.error("⚠️ Erro inesperado ao carregar emoções do time.");
    }
  };

  const registerEmotion = async (
    emotionId: number,
    intensity: number,
    notes: string,
    isAnonymous: boolean
  ) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      emotion_id: emotionId,
      intensity,
      notes,
      is_anonymous: isAnonymous,
    };

    try {
      const response = await fetch(`${API_URL}/emotion_record/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

      const newRecord = await response.json();
      setEmotionRecords((prev) => [newRecord, ...prev]);
      toast.success("🎉 Emoção registrada com sucesso!", { duration: 3000 });
    } catch (error) {
      console.error("Erro ao registrar emoção:", error);
      toast.error("❌ Erro ao registrar emoção.");
    }
  };

  const getEmotionDetails = (emotionId: number) =>
    emotions.find((emotion) => emotion.id === emotionId);

  useEffect(() => {
    if (user) {
      fetchEmotions();
      fetchTeamEmotions();
      fetchEmotionRecords();
    }
  }, [user]);

  return (
    <EmotionRecordContext.Provider
      value={{
        emotions,
        emotionRecords,
        teamEmotions,
        loading,
        fetchEmotions,
        fetchEmotionRecords,
        fetchTeamEmotions,
        registerEmotion,
        getEmotionDetails,
      }}
    >
      {children}
    </EmotionRecordContext.Provider>
  );
};

export const useEmotionRecordContext = () => {
  const context = useContext(EmotionRecordContext);
  if (!context) {
    throw new Error("useEmotionRecordContext deve ser usado dentro do EmotionRecordProvider");
  }
  return context;
};
