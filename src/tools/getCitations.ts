import { z } from "zod";

export const QUORIVA_GET_CITATIONS_NAME = "quoriva_get_citations";

export const QuorivaGetCitationsSchema = z.object({
  id: z.string()
    .describe(
      "Quoriva paper ID to look up citing papers for (e.g. 'ss_649def34...', 'pm_12345', 'ax_2303.08774'). " +
      "Resolved via Semantic Scholar — works best with 'ss_' prefixed IDs."
    ),
  limit: z.number().int().min(1).max(50).optional().default(10)
    .describe("Maximum number of citing papers to return (1–50). Defaults to 10."),
});

export const quorivaGetCitationsToolDef = {
  name: QUORIVA_GET_CITATIONS_NAME,
  description:
    "Quoriva: Find papers that have CITED a given paper (forward reference lookup). " +
    "Useful for understanding the impact and reach of a paper. Powered by Semantic Scholar.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Quoriva paper ID (e.g. 'ss_649def34...', 'pm_12345', 'ax_2303.08774').",
      },
      limit: {
        type: "number",
        description: "Max number of citing papers to return (default: 10, max: 50).",
        default: 10,
      },
    },
    required: ["id"],
  },
};
