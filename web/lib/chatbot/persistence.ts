import type { LearnedState } from "./types";

export type ChatEventKind = "conversation" | "feedback" | "unanswered" | "ticket";

// Storage driver for the chatbot's memory. Two implementations:
//   persistence-file.ts     — local JSON/JSONL files (dev, disk-backed hosts)
//   persistence-supabase.ts — chat_state + chat_events tables (serverless)
export type ChatPersistence = {
  loadLearned(): Promise<LearnedState | null>;
  saveLearned(state: LearnedState): Promise<void>;
  append(kind: ChatEventKind, payload: unknown): Promise<void>;
};

export function chatPersistence(): ChatPersistence {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("./persistence-supabase") as typeof import("./persistence-supabase")).supabasePersistence;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require("./persistence-file") as typeof import("./persistence-file")).filePersistence;
}
