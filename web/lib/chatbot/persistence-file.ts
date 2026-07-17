import { promises as fs } from "fs";
import path from "path";
import type { LearnedState } from "./types";
import type { ChatPersistence, ChatEventKind } from "./persistence";

// File driver:
//   data/chatbot/learned.json        token boosts + answer-variant scores
//   data/chatbot/conversations.jsonl every exchange (append-only)
//   data/chatbot/feedback.jsonl      every thumbs up/down
//   data/chatbot/unanswered.jsonl    learning queue: misses + downvoted answers
//   data/chatbot/tickets.jsonl       escalations to a human

const DATA_DIR = path.join(process.cwd(), "data", "chatbot");

const FILE_BY_KIND: Record<ChatEventKind, string> = {
  conversation: "conversations.jsonl",
  feedback: "feedback.jsonl",
  unanswered: "unanswered.jsonl",
  ticket: "tickets.jsonl",
};

export const filePersistence: ChatPersistence = {
  async loadLearned() {
    try {
      return JSON.parse(await fs.readFile(path.join(DATA_DIR, "learned.json"), "utf8")) as LearnedState;
    } catch {
      return null;
    }
  },

  async saveLearned(state) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, "learned.json"), JSON.stringify(state, null, 2), "utf8");
  },

  async append(kind, payload) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(path.join(DATA_DIR, FILE_BY_KIND[kind]), JSON.stringify(payload) + "\n", "utf8");
  },
};
