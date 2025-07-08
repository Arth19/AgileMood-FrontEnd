"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth-context";
import { getAllEmotionsWithIds } from "@/mocks/emotions";

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
  allEmotions: Emotion[];
  loading: boolean;
  fetchEmotions: () => Promise<void>;
  fetchEmotionRecords: () => Promise<void>;
  fetchTeamEmotions: () => Promise<void>;
  fetchEmotionRecordsForLoggedUser: () => Promise<void>; 
  fetchAllEmotions: () => Promise<void>;
  registerEmotion: (
    emotionId: number,
    intensity: number,
    notes: string,
    isAnonymous: boolean
  ) => Promise<void>;
  updateTeamEmotions: (selectedEmotionIds: number[]) => Promise<boolean>;
  getEmotionDetails: (emotionId: number) => Promise<Emotion | undefined>;
  createEmotion: (emotion: Omit<Emotion, 'id' | 'team_id'>) => Promise<{ success: boolean; data?: Emotion; error?: string }>;
  createMultipleEmotions: (emotions: Array<Omit<Emotion, 'id' | 'team_id'>>) => Promise<{ success: boolean; createdCount: number; errors: string[] }>;
}

// 🌟 **Mock de Emoções**
const mockEmotions: Emotion[] = getAllEmotionsWithIds();



const EmotionRecordContext = createContext<EmotionRecordContextProps | undefined>(undefined);

export const EmotionRecordProvider = ({ children }: { children: ReactNode }) => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [teamEmotions, setTeamEmotions] = useState<Emotion[]>([]);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [allEmotions, setAllEmotions] = useState<Emotion[]>([]);
  const [cachedEmotions, setCachedEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthContext();
  const fallbackUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://agilemood-backend-production.up.railway.app'
      : 'http://localhost:8000';

  const API_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

  // Variável para controlar o tempo da última chamada
  const lastFetchTimeRef = useRef({
    teamEmotions: 0,
    emotions: 0,
    emotionRecords: 0,
    allEmotions: 0
  });

  const fetchAndCacheEmotions = useCallback(async () => {
    console.log("🌍 Fetching emotions from API...");
  
    try {
      const response = await fetch(`${API_URL}/emotions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        console.error(`❌ Error fetching emotions (Status: ${response.status})`);
        return;
      }
  
      const data = await response.json();
      console.log(`✅ Loaded ${data.emotions.length} emotions from API.`);
      
      // Save emotions in memory (cache)
      setCachedEmotions(data.emotions);
    } catch (error) {
      console.error("❌ Unexpected error fetching emotions:", error);
    }
  }, [API_URL]);

  const fetchEmotionRecordsForLoggedUser = useCallback(async () => {
    if (!user) {
      console.warn("fetchEmotionRecordsForLoggedUser - Usuário não autenticado.");
      return;
    }

    const now = Date.now();
    if (now - lastFetchTimeRef.current.emotionRecords < 500) {
      console.log("fetchEmotionRecordsForLoggedUser - Chamada ignorada (muito frequente)");
      return;
    }

    lastFetchTimeRef.current.emotionRecords = now;
    setLoading(true);
    console.log("fetchEmotionRecordsForLoggedUser - Buscando registros de emoção do usuário logado");

    try {
      const response = await fetch(`${API_URL}/emotion_record/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEmotionRecords(data.emotion_records);
        console.log(`fetchEmotionRecordsForLoggedUser - ${data.emotion_records.length} registros encontrados`);
      } else {
        console.error("Erro ao buscar registros do usuário:", response.status, response.statusText);
        toast.error("⚠️ Erro ao carregar os registros de emoção.");
      }
    } catch (error) {
      console.error("Erro ao buscar registros do usuário:", error);
      toast.error("⚠️ Erro inesperado ao carregar os registros.");
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    if (user) {
      fetchEmotionRecordsForLoggedUser();
    }
  }, [user, fetchEmotionRecordsForLoggedUser]);
  
  // Memoizar as funções para evitar recriações desnecessárias
  const fetchEmotions = useCallback(async () => {
    // Evitar chamadas duplicadas em um curto período de tempo (500ms)
    const now = Date.now();
    if (now - lastFetchTimeRef.current.emotions < 500) {
      console.log("fetchEmotions - Chamada ignorada (muito frequente)");
      return;
    }
    
    lastFetchTimeRef.current.emotions = now;
    console.log("fetchEmotions - Iniciando busca de emoções");
    
    try {
      // Obter o team_id do parâmetro da URL se não estiver disponível no objeto do usuário
      let teamId = user?.team_id;
      
      if (!teamId) {
        // Tentar obter o ID do time da URL
        const pathParts = window.location.pathname.split('/');
        const idFromUrl = pathParts.length > 2 ? parseInt(pathParts[2], 10) : NaN;
        
        if (!isNaN(idFromUrl)) {
          teamId = idFromUrl;
          console.log("fetchEmotions - Team ID obtido da URL:", teamId);
        } else {
          console.log("fetchEmotions - Não foi possível determinar o ID do time");
          setEmotions(mockEmotions);
          toast.info("⚡ Exibindo emoções de exemplo.");
          return;
        }
      }
      
      // Usar o endpoint específico para buscar emoções do time
      const response = await fetch(`${API_URL}/teams/${teamId}/emotions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.emotions && data.emotions.length > 0) {
          console.log(`Encontradas ${data.emotions.length} emoções para o time ${teamId}`);
          setEmotions(data.emotions);
        } else {
          console.log("Nenhuma emoção encontrada para este time, usando mock");
          setEmotions(mockEmotions);
          toast.info("⚡ Exibindo emoções de exemplo.");
        }
      } else {
        console.error("Erro ao buscar emoções:", response.status, response.statusText);
        setEmotions(mockEmotions);
      }
    } catch (error) {
      console.error("Erro ao buscar emoções:", error);
      setEmotions(mockEmotions);
    }
  }, [user, API_URL]);



  const fetchEmotionRecords = useCallback(async () => {
    // Evitar chamadas duplicadas em um curto período de tempo (500ms)
    const now = Date.now();
    if (now - lastFetchTimeRef.current.emotionRecords < 500) {
      console.log("fetchEmotionRecords - Chamada ignorada (muito frequente)");
      return;
    }
    
    lastFetchTimeRef.current.emotionRecords = now;
    console.log("fetchEmotionRecords - Iniciando busca de registros");
    
    try {
      // Obter o team_id do parâmetro da URL se não estiver disponível no objeto do usuário
      let teamId = user?.team_id;
      
      if (!teamId) {
        // Tentar obter o ID do time da URL
        const pathParts = window.location.pathname.split('/');
        const idFromUrl = pathParts.length > 2 ? parseInt(pathParts[2], 10) : NaN;
        
        if (!isNaN(idFromUrl)) {
          teamId = idFromUrl;
          console.log("fetchEmotionRecords - Team ID obtido da URL:", teamId);
        } else {
          console.log("fetchEmotionRecords - Não foi possível determinar o ID do time");
          toast.info("📚 Nenhum registro encontrado.");
          return;
        }
      }

      const response = await fetch(`${API_URL}/teams/${teamId}/emotion-records`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmotionRecords(data.emotion_records );
        if (data.emotion_records.length === 0) toast.info("📚 Nenhum registro encontrado.");
      } else {
      
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
     
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const fetchTeamEmotions = useCallback(async () => {
    // Evitar chamadas duplicadas em um curto período de tempo (500ms)
    const now = Date.now();
    if (now - lastFetchTimeRef.current.teamEmotions < 500) {
      console.log("fetchTeamEmotions - Chamada ignorada (muito frequente)");
      return;
    }
    
    lastFetchTimeRef.current.teamEmotions = now;
    console.log("fetchTeamEmotions - Iniciando busca de emoções do time");
    
    try {
      // Obter o team_id do parâmetro da URL se não estiver disponível no objeto do usuário
      let teamId = user?.team_id;
      
      if (!teamId) {
        // Tentar obter o ID do time da URL
        const pathParts = window.location.pathname.split('/');
        const idFromUrl = pathParts.length > 2 ? parseInt(pathParts[2], 10) : NaN;
        
        if (!isNaN(idFromUrl)) {
          teamId = idFromUrl;
          console.log("fetchTeamEmotions - Team ID obtido da URL:", teamId);
        } else {
          console.log("fetchTeamEmotions - Não foi possível determinar o ID do time");
  
          toast.info("⚡ Exibindo emoções do time (mock).");
          return;
        }
      }
      
      // Usar o endpoint específico para buscar emoções do time
      console.log(`fetchTeamEmotions - Buscando emoções para o time ${teamId}`);
      const response = await fetch(`${API_URL}/teams/${teamId}/emotions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.emotions && data.emotions.length > 0) {
          console.log(`Encontradas ${data.emotions.length} emoções para o time ${teamId}`);
          setTeamEmotions(data.emotions);
        } else {
          console.log("Nenhuma emoção encontrada para este time, usando mock");
         
          toast.info("⚡ Exibindo emoções do time (mock).");
        }
      } else {
        console.error("Erro ao buscar emoções:", response.status, response.statusText);
       
      }
    } catch (error) {
      console.error("Erro ao buscar emoções do time:", error);
     
    }
  }, [user, API_URL]);

  const fetchAllEmotions = useCallback(async () => {
    // Evitar chamadas duplicadas em um curto período de tempo (500ms)
    const now = Date.now();
    if (now - lastFetchTimeRef.current.allEmotions < 500) {
      console.log("fetchAllEmotions - Chamada ignorada (muito frequente)");
      return;
    }
    
    lastFetchTimeRef.current.allEmotions = now;
    console.log("fetchAllEmotions - Iniciando busca de todas as emoções");
    
    try {
      const response = await fetch(`${API_URL}/emotions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.emotions && data.emotions.length > 0) {
          setAllEmotions(data.emotions);
        } else {
          // Usar o mock de emoções quando não há dados da API
          setAllEmotions(mockEmotions);
          toast.info("⚡ Exibindo emoções de exemplo.");
        }
      } else {
        // Usar o mock de emoções em caso de erro
        setAllEmotions(mockEmotions);
        toast.info("⚡ Exibindo emoções de exemplo.");
      }
    } catch (error) {
      console.error("Erro ao buscar todas as emoções:", error);
      setAllEmotions(mockEmotions);
    }
  }, [API_URL]);

  // Função para criar múltiplas emoções
  const createMultipleEmotions = useCallback(async (emotions: Array<Omit<Emotion, 'id' | 'team_id'>>): Promise<{ success: boolean; createdCount: number; errors: string[] }> => {
    // Obter o team_id do parâmetro da URL se não estiver disponível no objeto do usuário
    let teamId = user?.team_id;
    
    if (!teamId) {
      // Tentar obter o ID do time da URL
      const pathParts = window.location.pathname.split('/');
      const idFromUrl = pathParts.length > 2 ? parseInt(pathParts[2], 10) : NaN;
      
      if (!isNaN(idFromUrl)) {
        teamId = idFromUrl;
        console.log("createMultipleEmotions - Team ID obtido da URL:", teamId);
      } else {
        console.error("createMultipleEmotions - Não foi possível determinar o ID do time");
        return { 
          success: false, 
          createdCount: 0, 
          errors: ["Não foi possível determinar o ID do time"] 
        };
      }
    }

    // Verificar se o usuário é gerente
    if (user?.role !== "manager") {
      console.log("createMultipleEmotions - Usuário não é gerente:", {
        "user?.role": user?.role
      });
      return { 
        success: false, 
        createdCount: 0, 
        errors: ["Apenas gerentes podem criar emoções para o time"] 
      };
    }

    // Verificar se o array de emoções está vazio
    if (!Array.isArray(emotions) || emotions.length === 0) {
      console.error("createMultipleEmotions - Array de emoções vazio ou inválido");
      return { 
        success: false, 
        createdCount: 0, 
        errors: ["Nenhuma emoção para criar"] 
      };
    }

    console.log(`createMultipleEmotions - Iniciando criação de ${emotions.length} emoções para o time ${teamId}`);
    
    // Exibir toast de carregamento
    toast.loading(`Criando ${emotions.length} emoções para o time...`, { id: "emotions-loading" });

    const results = [];
    const errors = [];
    let createdCount = 0;

    // Fazer um POST para cada emoção
    for (const emotion of emotions) {
      try {
        const emotionWithTeamId = {
          ...emotion,
          team_id: teamId
        };

        console.log("Criando emoção:", emotionWithTeamId);

        const response = await fetch(`${API_URL}/emotions/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(emotionWithTeamId),
        });

        if (response.ok) {
          const data = await response.json();
          results.push(data);
          createdCount++;
          console.log(`Emoção "${emotion.name}" criada com sucesso:`, data);
        } else {
          const errorData = await response.json().catch(() => ({ message: "Erro ao processar resposta" }));
          const errorMessage = `Erro ao criar emoção "${emotion.name}": ${errorData.message || "Erro desconhecido"}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      } catch (error) {
        const errorMessage = `Erro de conexão ao criar emoção "${emotion.name}"`;
        console.error(errorMessage, error);
        errors.push(errorMessage);
      }
    }

    // Remover toast de carregamento
    toast.dismiss("emotions-loading");

    // Recarregar as emoções do time após o sucesso
    if (createdCount > 0) {
      await fetchTeamEmotions();
      toast.success(`🎉 ${createdCount} emoções criadas com sucesso!`);
    }

    // Exibir erros, se houver
    if (errors.length > 0) {
    }

    return {
      success: createdCount > 0,
      createdCount,
      errors
    };
  }, [user, API_URL, fetchTeamEmotions]);

  const updateTeamEmotions = useCallback(async (selectedEmotionIds: number[]): Promise<boolean> => {
    console.log("updateTeamEmotions - IDs recebidos:", selectedEmotionIds);
    console.log("updateTeamEmotions - Quantidade de IDs:", selectedEmotionIds.length);
    console.log("updateTeamEmotions - user:", user);
    
    // Verificar se o array de IDs está vazio ou não é um array
    if (!Array.isArray(selectedEmotionIds)) {
      console.error("updateTeamEmotions - selectedEmotionIds não é um array");
      return false;
    }
    
    // Verificar se o usuário é gerente
    if (user?.role !== "manager") {
      console.log("updateTeamEmotions - Usuário não é gerente:", {
        "user?.role": user?.role
      });
      return false;
    }
    
    // Obter o team_id do parâmetro da URL se não estiver disponível no objeto do usuário
    let teamId = user?.team_id;
    
    if (!teamId) {
      // Tentar obter o ID do time da URL
      const pathParts = window.location.pathname.split('/');
      const idFromUrl = pathParts.length > 2 ? parseInt(pathParts[2], 10) : NaN;
      
      if (!isNaN(idFromUrl)) {
        teamId = idFromUrl;
        console.log("updateTeamEmotions - Team ID obtido da URL:", teamId);
      } else {
        console.error("updateTeamEmotions - Não foi possível determinar o ID do time");
        return false;
      }
    }
    
    console.log("updateTeamEmotions - Team ID determinado:", teamId);
    
    // Verificar se foram selecionadas exatamente 6 emoções
    if (selectedEmotionIds.length !== 6) {
      console.log("updateTeamEmotions - Número incorreto de emoções:", selectedEmotionIds.length);
      return false;
    }

    try {
      // Exibir toast de carregamento
      toast.loading("Atualizando emoções do time...", { id: "emotions-loading" });

      const results = [];
      const errors = [];
      
      // Para cada emoção selecionada, fazer um POST individual
      for (const emotionId of selectedEmotionIds) {
        try {
          // Obter os detalhes da emoção
          const emotionDetails = allEmotions.find(e => e.id === emotionId);
          
          if (!emotionDetails) {
            console.error(`Emoção com ID ${emotionId} não encontrada`);
            errors.push(`Emoção com ID ${emotionId} não encontrada`);
            continue;
          }
          
          // Preparar o payload para esta emoção
          const payload = {
            name: emotionDetails.name,
            emoji: emotionDetails.emoji,
            color: emotionDetails.color,
            team_id: teamId,
            is_negative: emotionDetails.is_negative
          };
          
          console.log(`Enviando POST para emoção ${emotionId}:`, payload);
          
          // Fazer o POST para esta emoção
          const response = await fetch(`${API_URL}/emotions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Emoção ${emotionId} atualizada com sucesso:`, data);
            results.push(data);
          } else {
            const errorData = await response.json().catch(() => ({ message: "Erro ao processar resposta" }));
            const errorMessage = `Erro ao atualizar emoção ${emotionId}: ${errorData.message || "Erro desconhecido"}`;
            console.error(errorMessage);
            errors.push(errorMessage);
          }
        } catch (error) {
          const errorMessage = `Erro de conexão ao atualizar emoção ${emotionId}`;
          console.error(errorMessage, error);
          errors.push(errorMessage);
        }
      }
      
      // Remover toast de carregamento
      toast.dismiss("emotions-loading");
      
      // Verificar resultados
      if (results.length > 0) {
        console.log(`${results.length} emoções atualizadas com sucesso`);
        toast.success(`🎉 ${results.length} emoções atualizadas com sucesso!`);
        
        // Recarregar as emoções do time após o sucesso
        await fetchTeamEmotions();
        return true;
      }
      
      // Se chegou aqui, algo deu errado
      if (errors.length > 0) {
        console.error(`${errors.length} erros ao atualizar emoções:`, errors);
      } else {
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao atualizar emoções do time:", error);
      toast.dismiss("emotions-loading");
      return false;
    }
  }, [user, API_URL, fetchTeamEmotions, allEmotions]);

  const registerEmotion = useCallback(async (
    emotionId: number,
    intensity: number,
    notes: string,
    isAnonymous: boolean
  ) => {
    console.log("Iniciando registro de emoção:", { emotionId, intensity, isAnonymous });
    
    if (!user) {
      return;
    }
    
    const payload = {
      user_id: user.id,
      emotion_id: emotionId,
      intensity,
      notes,
      is_anonymous: isAnonymous,
    };

    console.log("Enviando payload:", payload);

    try {
      // Usando o novo endpoint /emotion_record/ conforme a especificação da API
      const response = await fetch(`${API_URL}/emotion_record/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Resposta da API:", { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error("Erro detalhado:", errorData);
        throw new Error(`Erro: ${errorData.message || response.statusText}`);
      }

      const newRecord = await response.json();
      console.log("Registro criado com sucesso:", newRecord);
      
      setEmotionRecords((prev) => [newRecord, ...prev]);
    } catch (error) {
      console.error("Erro ao registrar emoção:", error);
      throw error; // Propagar o erro para que o componente possa tratá-lo
    }
  }, [user, API_URL, setEmotionRecords]);

  const getEmotionDetails = useCallback(
    async (emotionId: number) => {
      console.log(`🔍 Searching for emotion with ID: ${emotionId}`);
  
      if (!emotionId) {
        console.warn("⚠️ getEmotionDetails - Invalid emotion ID.");
        return undefined;
      }
  
      // First, check in the cached emotions
      if (cachedEmotions.length > 0) {
        const cachedEmotion = cachedEmotions.find((emotion) => emotion.id === emotionId);
        if (cachedEmotion) {
          console.log(`✅ Found in cache: ${cachedEmotion.emoji} ${cachedEmotion.name} (ID: ${cachedEmotion.id})`);
          return cachedEmotion;
        }
      } else {
        console.warn("⚠️ getEmotionDetails - Emotion cache is empty.");
      }
  
      // If not found in cache, fetch and update cache
      console.log("🔄 Emotion not found in cache, fetching from API...");
      await fetchAndCacheEmotions();
  
      // Search again in updated cache
      const updatedEmotion = cachedEmotions.find((emotion) => emotion.id === emotionId);
      if (updatedEmotion) {
        console.log(`✅ Found after API fetch: ${updatedEmotion.emoji} ${updatedEmotion.name} (ID: ${updatedEmotion.id})`);
        return updatedEmotion;
      } else {
        console.error(`❌ Emotion not found after API fetch (ID: ${emotionId})`);
      }
  
      return undefined;
    },
    [cachedEmotions, fetchAndCacheEmotions]
  );
  
  // 📌 Load emotions into cache on first render
  useEffect(() => {
    fetchAndCacheEmotions();
  }, [fetchAndCacheEmotions]);
  

  // Função para criar uma nova emoção
  const createEmotion = useCallback(async (emotion: Omit<Emotion, 'id' | 'team_id'>): Promise<{ success: boolean; data?: Emotion; error?: string }> => {
    // Obter o team_id do parâmetro da URL se não estiver disponível no objeto do usuário
    let teamId = user?.team_id;
    
    if (!teamId) {
      // Tentar obter o ID do time da URL
      const pathParts = window.location.pathname.split('/');
      const idFromUrl = pathParts.length > 2 ? parseInt(pathParts[2], 10) : NaN;
      
      if (!isNaN(idFromUrl)) {
        teamId = idFromUrl;
        console.log("createEmotion - Team ID obtido da URL:", teamId);
      } else {
        console.error("createEmotion - Não foi possível determinar o ID do time");
        return { success: false, error: "Não foi possível determinar o ID do time" };
      }
    }

    try {
      const response = await fetch(`${API_URL}/teams/${teamId}/emotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(emotion),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data as Emotion };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || "Erro desconhecido"
        };
      }
    } catch (error) {
      console.error("Erro ao criar emoção:", error);
      return { 
        success: false, 
        error: "Erro de conexão ao criar emoção"
      };
    }
  }, [user, API_URL]);

 // 🚀 Criando o objeto de contexto
 const contextValue = useMemo(() => ({
  emotions,
  emotionRecords,
  teamEmotions,
  allEmotions,
  loading,
  fetchEmotions,
  fetchEmotionRecordsForLoggedUser,
  fetchTeamEmotions,
  fetchEmotionRecords,
  fetchAllEmotions,
  registerEmotion,
  updateTeamEmotions,
  getEmotionDetails,
  createEmotion,
  createMultipleEmotions
}), [
  emotions,
  emotionRecords,
  teamEmotions,
  allEmotions,
  loading,
  fetchEmotionRecords,
  fetchEmotions,
  fetchEmotionRecordsForLoggedUser,
  fetchTeamEmotions,
  fetchAllEmotions,
  registerEmotion,
  updateTeamEmotions,
  getEmotionDetails,
  createEmotion,
  createMultipleEmotions
]);
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carregar dados básicos mesmo sem usuário
        await fetchEmotions();
        await fetchTeamEmotions();
        
        // Carregar registros de emoções e todas as emoções se o usuário estiver logado
        if (user) {
          await fetchEmotionRecords();
          if (user.role === "manager") {
            await fetchAllEmotions();
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchEmotions, fetchTeamEmotions, fetchEmotionRecords, fetchAllEmotions, fetchEmotionRecordsForLoggedUser]);

  return (
    <EmotionRecordContext.Provider value={contextValue}>
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
