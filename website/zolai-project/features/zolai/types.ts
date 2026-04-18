export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  provider: string;
  model: string;
  updatedAt: string;
}

export interface TrainingRun {
  id: string;
  name: string;
  model: string;
  status: string;
  steps: number;
  maxSteps?: number | null;
  startedAt: string;
  endedAt?: string | null;
}

export interface WikiEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  status: string;
  tags: string[];
}
