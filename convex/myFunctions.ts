import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { PROVIDERS_AND_MODELS, filterNonNull } from "./utils";

export const getProviders = query({
  handler: async (ctx) => {
    return await ctx.db.query("providers").collect();
  },
});

export const getModels = query({
  handler: async (ctx) => {
    const providers = await ctx.db.query("providers").collect();
    const models = await ctx.db.query("models").collect();

    const modelsWithProvider = models.map((model) => {
      const identifiedProvider = providers.find(
        (provider) => provider._id === model.providerId
      );

      return identifiedProvider === undefined
        ? null
        : {
            ...model,
            provider: identifiedProvider,
          };
    });

    return filterNonNull(modelsWithProvider);
  },
});

export const addSupportedProvidersAndModels = internalMutation({
  handler: async (ctx) => {
    await Promise.all(
      PROVIDERS_AND_MODELS.map(async (providerAndModels) => {
        const providerId = await ctx.db.insert("providers", {
          name: providerAndModels.provider,
        });
        await Promise.all(
          providerAndModels.models.map((model) =>
            ctx.db.insert("models", {
              providerId: providerId,
              llm: model.llm,
              inputCostPerMillionTokens: model.inputCostPerMillionTokens,
              outputCostPerMillionTokens: model.outputCostPerMillionTokens,
              contextWindow: model.contextWindow,
              notes: model.notes,
              lastUpdated: Date.now(),
              default: model.default ?? false,
            })
          )
        );
      })
    );
  },
});

export const clearAll = internalMutation({
  handler: async (ctx) => {
    const models = await ctx.db.query("models").collect();
    await Promise.all(models.map((model) => ctx.db.delete(model._id)));

    const providers = await ctx.db.query("providers").collect();
    await Promise.all(providers.map((provider) => ctx.db.delete(provider._id)));
  },
});

export const getModelFromId = query({
  args: { id: v.id("models") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getProviderFromId = query({
  args: { id: v.id("providers") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const trackUsageStats = mutation({
  args: { modelStrings: v.array(v.string()) },
  handler: async (ctx, { modelStrings }) => {
    await ctx.db.insert("comparisons", {
      modelStrings: modelStrings,
    });
  },
});
