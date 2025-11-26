// Exemplo de custom hook para buscar dados da API
// Use este como base para criar seus próprios hooks

'use client';

import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { initialData = null, autoFetch = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  };
}

// Exemplo de uso:
// 
// import { api } from '@/lib/api';
// import { useApi } from '@/hooks/useApi';
//
// function UsersList() {
//   const { data: users, error, isLoading, refetch } = useApi(() => api.getUsers());
//
//   if (isLoading) return <p>Carregando...</p>;
//   if (error) return <p>Erro: {error.message}</p>;
//
//   return (
//     <div>
//       <button onClick={refetch}>Atualizar</button>
//       <ul>
//         {users?.map(user => <li key={user.id}>{user.name}</li>)}
//       </ul>
//     </div>
//   );
// }
