"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { ConvexMessageType, ModelOutput } from "./utils";
import { api } from "./_generated/api";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import MistralClient from "@mistralai/mistralai";

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
      };
    }

    const model = await ctx.runQuery(api.myFunctions.getModelFromId, {
      id: modelId,
    });
    if (model === null) throw new Error("Model not found.");

    try {
      if (provider.name === "OpenAI") {
        return await runOpenAI(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Anthropic") {
        return await runAnthropic(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Together") {
        return await runTogether(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Groq") {
        return await runGroq(ctx, { llm: model.llm, messages, apiKey });
      } else if (provider.name === "Mistral") {
        return await runMistral(ctx, { llm: model.llm, messages, apiKey });
      } else {
        throw new Error("Associated provider not implemented.");
      }
    } catch (e) {
      if (typeof e === "string") return { output: e, error: true, speed: 0 };
      else if (e instanceof Error)
        return { output: e.message, error: true, speed: 0 };
      else return { output: "An error occurred.", error: true, speed: 0 };
    }
  },
});

export const runOpenAI = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ModelOutput> => {
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
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ModelOutput> => {
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
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ModelOutput> => {
    const togetherClient = new OpenAI({
      apiKey,
      baseURL: "https://api.together.xyz/v1",
    });

    const start = Date.now();
    const response = await togetherClient.chat.completions.create({
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

export const runGroq = action({
  args: ProviderType,
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ModelOutput> => {
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
  handler: async (_ctx, { llm, messages, apiKey }): Promise<ModelOutput> => {
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
