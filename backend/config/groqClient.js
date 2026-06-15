import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;

const createOpenAICompletion = async (options) => {
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify(options),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.error?.message ||
        `OpenAI request failed with status ${response.status}`,
    );
    error.response = { data };
    throw error;
  }

  return data;
};

let client;
let provider;

if (groqApiKey) {
  client = new Groq({ apiKey: groqApiKey });
  provider = "groq";
} else if (openAiApiKey) {
  provider = "openai";
  client = {
    chat: {
      completions: {
        create: async (options) => {
          if (options.model?.startsWith("llama")) {
            options = {
              ...options,
              model: "gpt-3.5-turbo",
            };
          }
          return createOpenAICompletion(options);
        },
      },
    },
  };
} else {
  throw new Error(
    "No AI API key is configured. Set GROQ_API_KEY or OPENAI_API_KEY in backend/.env or your environment variables.",
  );
}

export default client;
export const AI_PROVIDER = provider;
