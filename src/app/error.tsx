'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcionalmente, você pode registrar o erro em um serviço de análise de erros
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <p className="mb-6 text-gray-600">
        Ocorreu um erro inesperado. Nossa equipe foi notificada.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
} 