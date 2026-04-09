import { z } from "zod";

export const QUORIVA_RECOMMEND_PAPERS_NAME = "quoriva_recommend_papers";

export const QuorivaRecommendPapersSchema = z.object({
  id: z.string()
    .describe(
      "Quoriva paper ID to get recommendations for (e.g. 'ss_649def34...', 'ax_2303.08774'). " +
      "Works best with 'ss_' prefixed IDs from quoriva_search_papers results."
    ),
  limit: z.number().int().min(1).max(50).optional().default(10)
    .describe("Maximum number of recommended papers to return (1–50). Defaults to 10."),
});

export const quorivaRecommendPapersToolDef = {
  name: QUORIVA_RECOMMEND_PAPERS_NAME,
  description:
    "Quoriva: Get AI-powered paper recommendations similar to a given paper. " +
    "Ideal for discovering related work and expanding a literature review. Powered by Semantic Scholar Recommendations API.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Quoriva paper ID (e.g. 'ss_649def34...', 'ax_2303.08774').",
      },
      limit: {
        type: "number",
        description: "Max recommendations to return (default: 10, max: 50).",
        default: 10,
      },
    },
    required: ["id"],
  },
};
