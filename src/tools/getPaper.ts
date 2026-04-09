import { z } from "zod";

export const QUORIVA_GET_PAPER_NAME = "quoriva_get_paper";

export const QuorivaGetPaperSchema = z.object({
  id: z.string()
    .describe(
      "The Quoriva paper ID returned by quoriva_search_papers (e.g. 'ss_649def34...', 'pm_39123456', 'ax_2303.08774'). " +
      "Also accepts a direct paper URL from arXiv, PubMed, or Semantic Scholar."
    ),
});

export const quorivaGetPaperToolDef = {
  name: QUORIVA_GET_PAPER_NAME,
  description:
    "Quoriva: Fetch full details of a single academic paper by its Quoriva ID or direct URL. " +
    "Use this after quoriva_search_papers to get complete information about a specific paper.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description:
          "Quoriva paper ID (e.g. 'ss_649def34...', 'pm_12345', 'ax_2303.08774') or a direct paper URL.",
      },
    },
    required: ["id"],
  },
};
