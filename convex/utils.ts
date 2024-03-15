import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const ConvexMessageType = v.object({
  role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  content: v.string(),
});

export type Message = typeof ConvexMessageType.type;

export type ModelOutput = (ProviderOutput & { cost: number }) | "loading";

export const CHARS_TO_TOKEN = 4;

export type ProviderOutput = {
  output: string;
  error: boolean;
  speed: number;
};

export const PROVIDERS_AND_MODELS: Array<{
  provider: string;
  models: Array<
    Omit<
      Doc<"models">,
      "_id" | "_creationTime" | "providerId" | "lastUpdated" | "default"
    > &
      Partial<Pick<Doc<"models">, "default">>
  >;
}> = [
  {
    provider: "OpenAI",
    models: [
      {
        llm: "gpt-4-0125-preview",
        inputCostPerMillionTokens: 10,
        outputCostPerMillionTokens: 30,
        contextWindow: 128000,
        default: true,
      },
      {
        llm: "gpt-3.5-turbo-0125",
        inputCostPerMillionTokens: 0.5,
        outputCostPerMillionTokens: 1.5,
        contextWindow: 16385,
      },
    ],
  },
  {
    provider: "Anthropic",
    models: [
      {
        llm: "claude-3-opus-20240229",
        inputCostPerMillionTokens: 15,
        outputCostPerMillionTokens: 75,
        contextWindow: 200000,
        default: true,
      },
      {
        llm: "claude-3-sonnet-20240229",
        inputCostPerMillionTokens: 3,
        outputCostPerMillionTokens: 15,
        contextWindow: 200000,
      },
      {
        llm: "claude-3-haiku-20240307",
        inputCostPerMillionTokens: 0.25,
        outputCostPerMillionTokens: 1.25,
        contextWindow: 200000,
      },
    ],
  },
  {
    provider: "Groq",
    models: [
      {
        llm: "llama2-70b-4096",
        contextWindow: 4096,
        inputCostPerMillionTokens: 0.7,
        outputCostPerMillionTokens: 0.8,
        default: true,
      },
      {
        llm: "mixtral-8x7b-32768",
        contextWindow: 32768,
        inputCostPerMillionTokens: 0.27,
        outputCostPerMillionTokens: 0.27,
      },
      {
        llm: "gemma-7b-it",
        contextWindow: 8192,
        inputCostPerMillionTokens: 0.1,
        outputCostPerMillionTokens: 0.1,
      },
    ],
  },
  {
    provider: "Together",
    models: [
      {
        llm: "google/gemma-7b-it",
        contextWindow: 8192,
        inputCostPerMillionTokens: 0.2,
        outputCostPerMillionTokens: 0.2,
      },
      {
        llm: "google/gemma-2b-it",
        contextWindow: 8192,
        inputCostPerMillionTokens: 0.1,
        outputCostPerMillionTokens: 0.1,
      },
      {
        llm: "meta-llama/Llama-2-70b-chat-hf",
        contextWindow: 4096,
        inputCostPerMillionTokens: 0.9,
        outputCostPerMillionTokens: 0.9,
      },
      {
        llm: "meta-llama/Llama-2-13b-chat-hf",
        contextWindow: 4096,
        inputCostPerMillionTokens: 0.225,
        outputCostPerMillionTokens: 0.225,
      },
      {
        llm: "meta-llama/Llama-2-7b-chat-hf",
        contextWindow: 4096,
        inputCostPerMillionTokens: 0.2,
        outputCostPerMillionTokens: 0.2,
      },
    ],
  },
  // {
  //   provider: "Google",
  //   models: [
  //     {
  //       llm: "gemini-1.0-pro-001",
  //       contextWindow: 30720,
  //       inputCostPerMillionTokens: 0,
  //       outputCostPerMillionTokens: 0,
  //       notes:
  //         "Rate limited to 60 QPM. Free per ai.google.dev/pricing as of 3/9/24",
  //     },
  //   ],
  // },
  {
    provider: "Mistral",
    models: [
      {
        llm: "open-mistral-7b",
        contextWindow: 32768,
        inputCostPerMillionTokens: 0.25,
        outputCostPerMillionTokens: 0.25,
      },
      {
        llm: "open-mixtral-8x7b",
        contextWindow: 32768,
        inputCostPerMillionTokens: 0.7,
        outputCostPerMillionTokens: 0.7,
      },
      {
        llm: "mistral-small-latest",
        contextWindow: 32768,
        inputCostPerMillionTokens: 2,
        outputCostPerMillionTokens: 6,
      },
      {
        llm: "mistral-medium-latest",
        contextWindow: 32768,
        inputCostPerMillionTokens: 2.7,
        outputCostPerMillionTokens: 8.1,
      },
      {
        llm: "mistral-large-latest",
        contextWindow: 32768,
        inputCostPerMillionTokens: 8,
        outputCostPerMillionTokens: 24,
      },
    ],
  },
];

export function filterNonNull<T>(array: Array<T | null>): T[] {
  return array.filter((item): item is T => item !== null);
}
