import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LearnedState } from "./types";
import type { ChatPersistence } from "./persistence";

// Supabase driver — used automatically when the Supabase env vars are set
// (read-only filesystems like Vercel can't use the file driver). Tables are
// in supabase-schema.sql: chat_state (key/value) and chat_events (append log).

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export const supabasePersistence: ChatPersistence = {
  async loadLearned() {
    const { data, error } = await supabase().from("chat_state").select("value").eq("key", "learned").maybeSingle();
    if (error) throw new Error(`chat_state read failed: ${error.message}`);
    return (data?.value as LearnedState) ?? null;
  },

  async saveLearned(state) {
    const { error } = await supabase()
      .from("chat_state")
      .upsert({ key: "learned", value: state, updated_at: new Date().toISOString() });
    if (error) throw new Error(`chat_state write failed: ${error.message}`);
  },

  async append(kind, payload) {
    const { error } = await supabase().from("chat_events").insert({ kind, payload });
    if (error) throw new Error(`chat_events insert failed: ${error.message}`);
  },
};
