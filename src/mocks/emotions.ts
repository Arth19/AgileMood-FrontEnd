// Mock de emoções para exibir na parte de Gerenciar Emoções do Time
export const mockEmotions = [
  // Emoções Positivas
  { name: "Feliz", emoji: "😄", color: "#FFD700", is_negative: false },
  { name: "Animado", emoji: "🤩", color: "#FF69B4", is_negative: false },
  { name: "Motivado", emoji: "🚀", color: "#32CD32", is_negative: false },
  { name: "Satisfeito", emoji: "😌", color: "#9370DB", is_negative: false },
  { name: "Confiante", emoji: "💪", color: "#4169E1", is_negative: false },
  { name: "Inspirado", emoji: "💡", color: "#FFA500", is_negative: false },
  { name: "Orgulhoso", emoji: "🏆", color: "#DAA520", is_negative: false },
  { name: "Tranquilo", emoji: "😊", color: "#20B2AA", is_negative: false },
  { name: "Grato", emoji: "🙏", color: "#8A2BE2", is_negative: false },
  { name: "Energizado", emoji: "⚡", color: "#FF4500", is_negative: false },
  { name: "Empolgado", emoji: "🎉", color: "#FF1493", is_negative: false },
  { name: "Relaxado", emoji: "🧘", color: "#48D1CC", is_negative: false },
  
  // Emoções Neutras
  { name: "Neutro", emoji: "😐", color: "#A9A9A9", is_negative: false },
  { name: "Pensativo", emoji: "🤔", color: "#778899", is_negative: false },
  { name: "Curioso", emoji: "🧐", color: "#6A5ACD", is_negative: false },
  { name: "Concentrado", emoji: "🧠", color: "#708090", is_negative: false },
  
  // Emoções Negativas
  { name: "Triste", emoji: "😢", color: "#87CEEB", is_negative: true },
  { name: "Frustrado", emoji: "😤", color: "#FF6347", is_negative: true },
  { name: "Ansioso", emoji: "😰", color: "#FFA07A", is_negative: true },
  { name: "Estressado", emoji: "😫", color: "#DC143C", is_negative: true },
  { name: "Confuso", emoji: "😵", color: "#9932CC", is_negative: true },
  { name: "Sobrecarregado", emoji: "🥵", color: "#B22222", is_negative: true },
  { name: "Preocupado", emoji: "😟", color: "#CD853F", is_negative: true },
  { name: "Desanimado", emoji: "😞", color: "#696969", is_negative: true },
  { name: "Entediado", emoji: "🥱", color: "#808080", is_negative: true },
  { name: "Inseguro", emoji: "😬", color: "#8B4513", is_negative: true },
  { name: "Decepcionado", emoji: "😔", color: "#4682B4", is_negative: true },
  { name: "Exausto", emoji: "😩", color: "#800000", is_negative: true },
  { name: "Irritado", emoji: "😠", color: "#FF4500", is_negative: true },
  { name: "Impaciente", emoji: "⏱️", color: "#FF8C00", is_negative: true }
];

// Função para obter um conjunto equilibrado de emoções (3 positivas e 3 negativas)
export const getBalancedEmotions = () => {
  const positiveEmotions = mockEmotions.filter(emotion => !emotion.is_negative).slice(0, 3);
  const negativeEmotions = mockEmotions.filter(emotion => emotion.is_negative).slice(0, 3);
  
  return [...positiveEmotions, ...negativeEmotions];
};

// Função para obter todas as emoções com IDs
export const getAllEmotionsWithIds = () => {
  return mockEmotions.map((emotion, index) => ({
    ...emotion,
    id: -(index + 1),
    team_id: 1,
  }));
};