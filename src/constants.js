export const SYSTEM_PROMPT_DEFAULT =
  "You are a helpful, intelligent, and friendly AI assistant. Answer clearly and concisely.";

export const STORAGE_KEY = "chatbot_v1_messages";
export const TITLE_KEY   = "chatbot_v1_title";

export const MODELS = [
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

export const TOKEN_COSTS = {
  "gpt-4o":       { input: 2.50,  output: 10.00 },
  "gpt-4o-mini":  { input: 0.15,  output: 0.60  },
  "gpt-4-turbo":  { input: 10.00, output: 30.00 },
};

export const SUGGESTIONS = [
  "Explain quantum computing",
  "Write a short story",
  "Help me debug code",
  "Give me a recipe idea",
];
