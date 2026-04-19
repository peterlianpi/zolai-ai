import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

type CreateLevelInput = Parameters<typeof client.api.curriculum.levels.$post>[0]['json'];

export const useLevels = () =>
  useQuery({
    queryKey: ['curriculum', 'levels'],
    queryFn: async () => {
      const res = await client.api.curriculum.levels.$get();
      return res.json();
    },
  });

export const useLevel = (id: string) =>
  useQuery({
    queryKey: ['curriculum', 'level', id],
    queryFn: async () => {
      const res = await client.api.curriculum.levels[':id'].$get({ param: { id } });
      return res.json();
    },
    enabled: !!id,
  });

export const useCreateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLevelInput) => {
      const res = await client.api.curriculum.levels.$post({ json: data });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'levels'] });
    },
  });
};
