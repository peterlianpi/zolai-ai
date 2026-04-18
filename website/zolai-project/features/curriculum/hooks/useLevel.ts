import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export const useLevels = () =>
  useQuery({
    queryKey: ['curriculum', 'levels'],
    queryFn: async () => {
      const res = await client.api.curriculum.levels.$get();
      return res.json();
    },
  });
