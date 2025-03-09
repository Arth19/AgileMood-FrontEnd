# Mock de Emoções para AgileMood

Este diretório contém mocks para o sistema AgileMood, incluindo um conjunto diversificado de emoções para uso na aplicação.

## Estrutura do Mock de Emoções

Cada emoção no mock segue esta estrutura:

```typescript
{
  name: string;       // Nome da emoção
  emoji: string;      // Emoji representando a emoção
  color: string;      // Código de cor hexadecimal
  is_negative: boolean; // Se é uma emoção negativa ou não
}
```

## Funções Disponíveis

O arquivo `emotions.ts` exporta as seguintes funções:

- `mockEmotions`: Array com todas as emoções disponíveis
- `getBalancedEmotions()`: Retorna um conjunto equilibrado de 6 emoções (3 positivas e 3 negativas)
- `getAllEmotionsWithIds()`: Retorna todas as emoções com IDs e team_id adicionados

## Categorias de Emoções

O mock inclui:

- **Emoções Positivas**: Feliz, Animado, Motivado, Satisfeito, etc.
- **Emoções Neutras**: Neutro, Pensativo, Curioso, Concentrado
- **Emoções Negativas**: Triste, Frustrado, Ansioso, Estressado, etc.

## Visualização

Você pode visualizar todas as emoções disponíveis na página de demonstração em `/emotions-demo`.

## Uso

Para usar o mock em um componente:

```typescript
import { mockEmotions, getBalancedEmotions, getAllEmotionsWithIds } from "@/mocks/emotions";

// Usar todas as emoções
const allEmotions = getAllEmotionsWithIds();

// Usar um conjunto equilibrado de emoções
const balancedEmotions = getBalancedEmotions();
``` 