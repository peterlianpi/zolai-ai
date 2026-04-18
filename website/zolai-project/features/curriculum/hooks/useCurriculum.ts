import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

// ── Levels ────────────────────────────────────────────────────────────────────
export const useLevels = () =>
  useQuery({
    queryKey: ['curriculum', 'levels'],
    queryFn: async () => {
      const res = await client.api.curriculum.levels.$get();
      if (!res.ok) throw new Error('Failed to fetch levels');
      return res.json();
    },
  });

// ── Sections ──────────────────────────────────────────────────────────────────
export const useSections = (levelCode?: string) =>
  useQuery({
    queryKey: ['curriculum', 'sections', levelCode],
    queryFn: async () => {
      const res = await client.api.curriculum.sections.$get(
        { query: { levelCode } }
      );
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },
  });

// ── Units ─────────────────────────────────────────────────────────────────────
export const useUnits = (sectionId?: string) =>
  useQuery({
    queryKey: ['curriculum', 'units', sectionId],
    queryFn: async () => {
      const res = await client.api.curriculum.units.$get(
        { query: { sectionId } }
      );
      if (!res.ok) throw new Error('Failed to fetch units');
      return res.json();
    },
    enabled: !!sectionId,
  });

export const useUnit = (id: string) =>
  useQuery({
    queryKey: ['curriculum', 'unit', id],
    queryFn: async () => {
      const res = await client.api.curriculum.units[':id'].$get({ param: { id } });
      if (!res.ok) throw new Error('Failed to fetch unit');
      return res.json();
    },
    enabled: !!id,
  });

// ── Sub-units ─────────────────────────────────────────────────────────────────
export const useSubUnits = (unitId?: string) =>
  useQuery({
    queryKey: ['curriculum', 'sub-units', unitId],
    queryFn: async () => {
      const res = await client.api.curriculum['sub-units'].$get(
        { query: { unitId } }
      );
      if (!res.ok) throw new Error('Failed to fetch sub-units');
      return res.json();
    },
    enabled: !!unitId,
  });

export const useSubUnit = (id: string) =>
  useQuery({
    queryKey: ['curriculum', 'sub-unit', id],
    queryFn: async () => {
      const res = await client.api.curriculum['sub-units'][':id'].$get({ param: { id } });
      if (!res.ok) throw new Error('Failed to fetch sub-unit');
      return res.json();
    },
    enabled: !!id,
  });

// ── Phonics ───────────────────────────────────────────────────────────────────
export const usePhonicsUnits = (category?: string) =>
  useQuery({
    queryKey: ['phonics', 'units', category],
    queryFn: async () => {
      const res = await client.api.curriculum.phonics.$get(
        { query: { category } }
      );
      if (!res.ok) throw new Error('Failed to fetch phonics units');
      return res.json();
    },
  });

export const usePhonicsUnit = (id: string) =>
  useQuery({
    queryKey: ['phonics', 'unit', id],
    queryFn: async () => {
      const res = await client.api.curriculum.phonics[':id'].$get({ param: { id } });
      if (!res.ok) throw new Error('Failed to fetch phonics unit');
      return res.json();
    },
    enabled: !!id,
  });

// ── Workflow status ───────────────────────────────────────────────────────────
export const useWorkflowStatus = () =>
  useQuery({
    queryKey: ['curriculum', 'workflow', 'status'],
    queryFn: async () => {
      const res = await client.api.curriculum.workflow.status.$get();
      if (!res.ok) throw new Error('Failed to fetch workflow status');
      return res.json();
    },
    refetchInterval: 60000,
  });
