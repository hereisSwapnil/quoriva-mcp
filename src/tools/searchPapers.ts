import { z } from "zod";

export const QUORIVA_SEARCH_PAPERS_NAME = "quoriva_search_papers";

export const QuorivaSearchPapersSchema = z.object({
  query: z.string()
    .describe("The search query or direct URL (arXiv, PubMed, Semantic Scholar) to look up. Example values: 'LLM alignment techniques', 'https://arxiv.org/abs/2303.08774'"),
});

export const quorivaSearchPapersToolDef = {
  name: QUORIVA_SEARCH_PAPERS_NAME,
  description: "Quoriva Search: Search academic papers across Semantic Scholar, PubMed, and arXiv in parallel. You can pass a broad query or a direct supported paper URL.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query or direct URL. Ex: 'reinforcement learning' or 'https://arxiv.org/abs/2303.08774'",
      },
    },
    required: ["query"],
  },
};
