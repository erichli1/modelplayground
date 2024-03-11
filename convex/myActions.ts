"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { ConvexMessageType, ModelOutput } from "./utils";
import { api } from "./_generated/api";
import OpenAI from "openai";

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
      return { output: "Internal error. Provider not found.", error: true };
    }

    // OpenAI, Anthropic, Together, Groq, Google, Mistral
    if (provider.name === "OpenAI") {
      return await ctx.runAction(api.myActions.runOpenAI, {
        modelId,
        messages,
        apiKey,
      });
    } else if (provider.name === "Anthropic") {
      return {
        output: "done!",
        error: false,
      };
    } else if (provider.name === "Together") {
      return {
        output: "done!",
        error: false,
      };
    } else if (provider.name === "Groq") {
      return {
        output: "done!",
        error: false,
      };
    } else if (provider.name === "Google") {
      return {
        output: "done!",
        error: false,
      };
    } else if (provider.name === "Mistral") {
      return {
        output: "done!",
        error: false,
      };
    } else {
      throw new Error("Associated provider not implemented.");
    }
  },
});

export const runOpenAI = action({
  args: {
    modelId: v.id("models"),
    messages: v.array(ConvexMessageType),
    apiKey: v.string(),
  },
  handler: async (ctx, { modelId, messages, apiKey }): Promise<ModelOutput> => {
    const model = await ctx.runQuery(api.myFunctions.getModelFromId, {
      id: modelId,
    });
    if (model === null) throw new Error("Model not found.");

    const openai = new OpenAI({ apiKey });
    try {
      const response = await openai.chat.completions.create({
        model: model.llm,
        messages,
      });

      if (response.choices[0].message.content === null)
        return {
          output: "Null response received from OpenAI.",
          error: true,
        };

      return {
        output: response.choices[0].message.content,
        error: false,
      };
    } catch (e) {
      if (typeof e === "string") return { output: e, error: true };
      else if (e instanceof Error) return { output: e.message, error: true };
    }

    return {
      output: "done!",
      error: false,
    };
  },
});
