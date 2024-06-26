"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  CHARS_TO_TOKEN,
  ConvexMessageType,
  ModelOutput,
  ProviderOutput,
} from "./utils";
import { api } from "./_generated/api";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import MistralClient from "@mistralai/mistralai";
import { CohereClient } from "cohere-ai";
import { ChatMessageRole } from "cohere-ai/api";

const ProviderType = {
  llm: v.string(),
  messages: v.array(ConvexMessageType),
  apiKey: v.string(),
};

export const runModel = action({
  args: {
    providerId: v.id("providers"),
    modelId: v.id("models"),
    messages: v.array(ConvexMessageType),
    apiKey: v.string(),
  },
  handler: async (
    ctx,
    { providerId, modelId, messages, apiKey }
  ): Promise<ModelOutput> => {
    const provider = await ctx.runQuery(api.myFunctions.getProviderFromId, {
      id: providerId,
    });

    if (provider === null) {
      console.error("Provider not found.");
      return {
        output: "Internal error. Provider not found.",
        error: true,
        speed: 0,
        cost: 0,
      };
    }

    const model = await ctx.runQuery(api.myFunctions.getModelFromId, {
      id: modelId,
    });
    if (model === null) throw new Error("Model not found.");

    try {
      let output: ProviderOutput;

      if (provider.name === "OpenAI") {
        output = await runOpenAI(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Anthropic") {
        output = await runAnthropic(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Together") {
        output = await runTogether(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Groq") {
        output = await runGroq(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Mistral") {
        output = await runMistral(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Cohere") {
        output = await runCohere(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Perplexity") {
        output = await runPerplexity(ctx, { llm: model.llm, messages, apiKey });
      } else {
        throw new Error("Associated provider not implemented.");
      }

      const inputMillionTokens =
        (messages.reduce((acc, m) => acc + m.content.length, 0) *
          CHARS_TO_TOKEN) /
        1e6;
      const outputMillionTokens = (output.output.length * CHARS_TO_TOKEN) / 1e6;

      return {
        ...output,
        cost:
          inputMillionTokens * model.inputCostPerMillionTokens +
          outputMillionTokens * model.outputCostPerMillionTokens +
          (model.requestCost ?? 0),
      };
    } catch (e) {
      if (typeof e === "string")
        return { output: e, error: true, speed: 0, cost: 0 };
      else if (e instanceof Error)
        return { output: e.message, error: true, speed: 0, cost: 0 };
      else
        return { output: "An error occurred.", error: true, speed: 0, cost: 0 };
    }
  },
});

export const runCohere = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const cohere = new CohereClient({ token: apiKey });

    const message = messages[messages.length - 1].content;
    const chatHistory = messages
      .map((m) => ({
        role:
          m.role === "user"
            ? ChatMessageRole.User
            : m.role === "system"
            ? ChatMessageRole.System
            : ChatMessageRole.Chatbot,
        message: m.content,
      }))
      .slice(0, -1);

    const start = Date.now();
    const response = await cohere.chat({
      model: llm,
      message,
      chatHistory,
    });
    const end = Date.now();

    return {
      output: response.text,
      error: false,
      speed: end - start,
    };
  },
});

export const runPerplexity = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const perplexityClient = new OpenAI({
      apiKey,
      baseURL: "https://api.perplexity.ai",
    });

    // From Perplexity, it is recommended to use only single-turn
    // conversations and avoid system prompts for the online LLMs
    const singleMessage = messages.map((m) => m.content).join("\n");

    const start = Date.now();
    const response = await perplexityClient.chat.completions.create({
      model: llm,
      messages: [
        {
          role: "user",
          content: singleMessage,
        },
      ],
    });
    const end = Date.now();

    if (response.choices[0].message.content === null)
      return {
        output: "Null response received from provider.",
        error: true,
        speed: 0,
      };

    return {
      output: response.choices[0].message.content,
      error: false,
      speed: end - start,
    };
  },
});

export const runOpenAI = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const openai = new OpenAI({ apiKey });

    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: llm,
      messages,
    });
    const end = Date.now();

    if (response.choices[0].message.content === null)
      return {
        output: "Null response received from provider.",
        error: true,
        speed: 0,
      };

    return {
      output: response.choices[0].message.content,
      error: false,
      speed: end - start,
    };
  },
});

export const runAnthropic = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const anthropic = new Anthropic({ apiKey });

    const start = Date.now();
    const message = await anthropic.messages.create({
      model: llm,
      system: messages[0].content,
      messages: messages.slice(1).map((m) => ({
        role: m.role === "system" ? "assistant" : m.role,
        content: m.content,
      })),
      max_tokens: 1024,
    });
    const end = Date.now();

    return {
      error: false,
      output: message.content[0].text,
      speed: end - start,
    };
  },
});

export const runTogether = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const togetherClient = new OpenAI({
      apiKey,
      baseURL: "https://api.together.xyz/v1",
    });

    const start = Date.now();
    const response = await togetherClient.chat.completions.create({
      model: llm,
      messages,
      // 4/10/24: Need to add a max_tokens, else dbrx-instruct returns early
      // TODO: remove this when no longer needed
      max_tokens: 1024,
    });
    const end = Date.now();

    if (response.choices[0].message.content === null)
      return {
        output: "Null response received from provider.",
        error: true,
        speed: 0,
      };

    return {
      output: response.choices[0].message.content,
      error: false,
      speed: end - start,
    };
  },
});

export const runGroq = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const groq = new Groq({ apiKey });

    const start = Date.now();
    const response = await groq.chat.completions.create({
      model: llm,
      messages,
    });
    const end = Date.now();

    return {
      output: response.choices[0].message.content,
      error: false,
      speed: end - start,
    };
  },
});

export const runMistral = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ProviderOutput> => {
    const mistral = new MistralClient(apiKey);

    const start = Date.now();
    const response = await mistral.chat({
      model: llm,
      messages,
    });
    const end = Date.now();

    return {
      output: response.choices[0].message.content,
      error: false,
      speed: end - start,
    };
  },
});
