import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Tool definitions
import { QUORIVA_SEARCH_PAPERS_NAME, QuorivaSearchPapersSchema, quorivaSearchPapersToolDef } from "./tools/searchPapers.js";
import { QUORIVA_GET_PAPER_NAME, QuorivaGetPaperSchema, quorivaGetPaperToolDef } from "./tools/getPaper.js";
import { QUORIVA_GET_CITATIONS_NAME, QuorivaGetCitationsSchema, quorivaGetCitationsToolDef } from "./tools/getCitations.js";
import { QUORIVA_GET_REFERENCES_NAME, QuorivaGetReferencesSchema, quorivaGetReferencesToolDef } from "./tools/getReferences.js";
import { QUORIVA_GET_AUTHOR_PAPERS_NAME, QuorivaGetAuthorPapersSchema, quorivaGetAuthorPapersToolDef } from "./tools/getAuthorPapers.js";
import { QUORIVA_RECOMMEND_PAPERS_NAME, QuorivaRecommendPapersSchema, quorivaRecommendPapersToolDef } from "./tools/recommendPapers.js";

// Services
import { executeParallelSearch, fetchPaperFromUrl } from "./services/parallelSearch.js";
import {
  fetchPaperCitations,
  fetchPaperReferences,
  fetchAuthorPapers,
  fetchPaperRecommendations,
} from "./services/semanticScholar.js";
import { fetchSemanticScholarById } from "./services/semanticScholar.js";
import { fetchPubMedById } from "./services/pubmed.js";
import { fetchArXivById } from "./services/arxiv.js";

// Utilities
import { formatPaper, formatPaperList } from "./utils/formatter.js";

export class QuorivaServer {
  public server: Server;

  constructor() {
    this.server = new Server(
      { name: "quoriva-mcp", version: "1.1.0" },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        quorivaSearchPapersToolDef,
        quorivaGetPaperToolDef,
        quorivaGetCitationsToolDef,
        quorivaGetReferencesToolDef,
        quorivaGetAuthorPapersToolDef,
        quorivaRecommendPapersToolDef,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case QUORIVA_SEARCH_PAPERS_NAME:   return this.handleSearchPapers(args);
        case QUORIVA_GET_PAPER_NAME:       return this.handleGetPaper(args);
        case QUORIVA_GET_CITATIONS_NAME:   return this.handleGetCitations(args);
        case QUORIVA_GET_REFERENCES_NAME:  return this.handleGetReferences(args);
        case QUORIVA_GET_AUTHOR_PAPERS_NAME: return this.handleGetAuthorPapers(args);
        case QUORIVA_RECOMMEND_PAPERS_NAME: return this.handleRecommendPapers(args);
        default:
          throw new Error(`Unknown Quoriva tool: "${name}". Available: quoriva_search_papers, quoriva_get_paper, quoriva_get_citations, quoriva_get_references, quoriva_get_author_papers, quoriva_recommend_papers`);
      }
    });
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  private async handleSearchPapers(args: unknown) {
    try {
      const { query } = QuorivaSearchPapersSchema.parse(args);
      const papers = await executeParallelSearch(query);

      if (papers.length === 0) {
        return this.textResult(`No papers found for "${query}". Try broader keywords or a different search term.`);
      }

      return this.textResult(
        formatPaperList(
          papers.slice(0, 8),
          `[QUORIVA SEARCH] Found ${papers.length} papers for "${query}" — showing top ${Math.min(papers.length, 8)} by citation count:`
        )
      );
    } catch (err) {
      return this.errorResult(`quoriva_search_papers failed: ${(err as Error).message}`);
    }
  }

  private async handleGetPaper(args: unknown) {
    try {
      const { id } = QuorivaGetPaperSchema.parse(args);

      // Try direct URL first, then parse prefix
      let paper = await fetchPaperFromUrl(id);

      if (!paper) {
        if (id.startsWith('ss_')) {
          paper = await fetchSemanticScholarById(id.slice(3));
        } else if (id.startsWith('pm_')) {
          paper = await fetchPubMedById(id.slice(3));
        } else if (id.startsWith('ax_')) {
          paper = await fetchArXivById(id.slice(3));
        } else {
          // Raw SS ID fallback
          paper = await fetchSemanticScholarById(id);
        }
      }

      if (!paper) {
        return this.errorResult(
          `No paper found for ID "${id}". Ensure the ID is from a quoriva_search_papers result (e.g. 'ss_...', 'pm_...', 'ax_...') or a valid paper URL.`
        );
      }

      return this.textResult(`[QUORIVA PAPER DETAILS]\n\n${formatPaper(paper)}`);
    } catch (err) {
      return this.errorResult(`quoriva_get_paper failed: ${(err as Error).message}`);
    }
  }

  private async handleGetCitations(args: unknown) {
    try {
      const { id, limit } = QuorivaGetCitationsSchema.parse(args);
      const papers = await fetchPaperCitations(id, limit);

      return this.textResult(
        formatPaperList(
          papers,
          `[QUORIVA CITATIONS] Papers that cited "${id}" (${papers.length} found):`
        )
      );
    } catch (err) {
      return this.errorResult(`quoriva_get_citations failed: ${(err as Error).message}. Try using an 'ss_' prefixed ID for best results.`);
    }
  }

  private async handleGetReferences(args: unknown) {
    try {
      const { id, limit } = QuorivaGetReferencesSchema.parse(args);
      const papers = await fetchPaperReferences(id, limit);

      return this.textResult(
        formatPaperList(
          papers,
          `[QUORIVA REFERENCES] Papers referenced by "${id}" (${papers.length} found):`
        )
      );
    } catch (err) {
      return this.errorResult(`quoriva_get_references failed: ${(err as Error).message}. Try using an 'ss_' prefixed ID for best results.`);
    }
  }

  private async handleGetAuthorPapers(args: unknown) {
    try {
      const { author, limit } = QuorivaGetAuthorPapersSchema.parse(args);
      const result = await fetchAuthorPapers(author, limit);

      if (!result) {
        return this.errorResult(
          `No author found matching "${author}". Try using the full name (e.g. "Geoffrey Hinton") or a slight variation.`
        );
      }

      return this.textResult(
        formatPaperList(
          result.papers,
          `[QUORIVA AUTHOR] Top papers by ${result.authorName} (${result.papers.length} found, sorted by citations):`
        )
      );
    } catch (err) {
      return this.errorResult(`quoriva_get_author_papers failed: ${(err as Error).message}`);
    }
  }

  private async handleRecommendPapers(args: unknown) {
    try {
      const { id, limit } = QuorivaRecommendPapersSchema.parse(args);
      const papers = await fetchPaperRecommendations(id, limit);

      if (papers.length === 0) {
        return this.errorResult(
          `No recommendations found for "${id}". Recommendations work best with Semantic Scholar IDs ('ss_' prefix). Try quoriva_search_papers first to get a valid 'ss_' ID.`
        );
      }

      return this.textResult(
        formatPaperList(
          papers,
          `[QUORIVA RECOMMENDATIONS] Papers similar to "${id}" (${papers.length} found):`
        )
      );
    } catch (err) {
      return this.errorResult(`quoriva_recommend_papers failed: ${(err as Error).message}`);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private textResult(text: string) {
    return { content: [{ type: "text" as const, text }] };
  }

  private errorResult(text: string) {
    return { isError: true, content: [{ type: "text" as const, text }] };
  }
}
