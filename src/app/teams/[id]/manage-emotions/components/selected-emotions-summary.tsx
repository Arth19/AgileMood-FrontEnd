"use client";

// Definindo a interface Emotion localmente
interface Emotion {
  id: number;
  name: string;
  emoji: string;
  color: string;
  team_id: number;
  is_negative: boolean;
}

interface SelectedEmotionsSummaryProps {
  selectedEmotions: number[]; // IDs das emoções selecionadas
  allEmotions: Emotion[];
}

export default function SelectedEmotionsSummary({ 
  selectedEmotions, 
  allEmotions 
}: SelectedEmotionsSummaryProps) {
  // Obter os detalhes completos das emoções selecionadas
  const selectedEmotionsDetails = selectedEmotions.map(id => 
    allEmotions.find(emotion => emotion.id === id)
  ).filter(Boolean) as Emotion[];

  // Contar emoções positivas e negativas
  const positiveEmotions = selectedEmotionsDetails.filter(e => !e.is_negative);
  const negativeEmotions = selectedEmotionsDetails.filter(e => e.is_negative);

  // Verificar se há um equilíbrio adequado
  const isBalanced = positiveEmotions.length >= 2 && negativeEmotions.length >= 2;

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <h3 className="font-medium mb-2">Resumo das Emoções Selecionadas</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedEmotionsDetails.map(emotion => (
          <div 
            key={emotion.id}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{ 
              backgroundColor: `${emotion.color}20`,
              borderColor: emotion.color,
              color: emotion.color
            }}
          >
            <span>{emotion.emoji}</span>
            <span>{emotion.name}</span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 text-sm">
        <div>
          <span className="font-medium">Positivas:</span> {positiveEmotions.length}
        </div>
        <div>
          <span className="font-medium">Negativas:</span> {negativeEmotions.length}
        </div>
      </div>
      
      {selectedEmotionsDetails.length === 6 && !isBalanced && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          <p className="font-medium">Atenção:</p>
          <p>Recomendamos um equilíbrio melhor entre emoções positivas e negativas (pelo menos 2 de cada).</p>
        </div>
      )}
      
      {selectedEmotionsDetails.length === 6 && isBalanced && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          <p className="font-medium">Ótima escolha!</p>
          <p>Você tem um bom equilíbrio entre emoções positivas e negativas.</p>
        </div>
      )}
    </div>
  );
} 