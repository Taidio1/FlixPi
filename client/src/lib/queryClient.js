import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// API helper compatible with existing axios setup
export const apiRequest = async (method, endpoint, data = {}) => {
  const api = (await import('../services/api')).default;
  
  switch (method) {
    case 'GET':
      const response = await api.get(endpoint);
      return response.data;
    case 'POST':
      return (await api.post(endpoint, data)).data;
    case 'PUT':
      return (await api.put(endpoint, data)).data;
    case 'DELETE':
      return (await api.delete(endpoint)).data;
    case 'PATCH':
      return (await api.patch(endpoint, data)).data;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};
