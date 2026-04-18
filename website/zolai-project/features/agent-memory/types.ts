export interface AgentMemoryMap {
  [key: string]: unknown;
}

export interface AgentLearnLog {
  id: string;
  agentId: string;
  taskType: string;
  input?: unknown;
  output?: unknown;
  feedback?: string | null;
  lesson?: string | null;
  createdAt: string;
}
