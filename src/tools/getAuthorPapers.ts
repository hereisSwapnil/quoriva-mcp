import { z } from "zod";

export const QUORIVA_GET_AUTHOR_PAPERS_NAME = "quoriva_get_author_papers";

export const QuorivaGetAuthorPapersSchema = z.object({
  author: z.string()
    .describe(
      "The full name of the author to look up. Ex: 'Andrej Karpathy', 'Yoshua Bengio', 'Geoffrey Hinton'."
    ),
  limit: z.number().int().min(1).max(50).optional().default(10)
    .describe("Maximum number of papers to return, sorted by citation count (1–50). Defaults to 10."),
});

export const quorivaGetAuthorPapersToolDef = {
  name: QUORIVA_GET_AUTHOR_PAPERS_NAME,
  description:
    "Quoriva: Search for an academic author by name and retrieve their published papers, " +
    "sorted by citation count. Powered by Semantic Scholar.",
  inputSchema: {
    type: "object",
    properties: {
      author: {
        type: "string",
        description: "Full name of the author. Ex: 'Geoffrey Hinton', 'Andrej Karpathy'.",
      },
      limit: {
        type: "number",
        description: "Max papers to return sorted by citations (default: 10, max: 50).",
        default: 10,
      },
    },
    required: ["author"],
  },
};
