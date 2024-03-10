"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// export const runModel = action({
//   args: {
//     provider:
//   },
// });

export const runOpenAILLM = action({
  args: {
    model: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { model, prompt }) => {},
});
