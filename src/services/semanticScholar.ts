import { Paper, SemanticScholarResponse, SemanticScholarPaper, CitationsResponse, ReferencesResponse, AuthorSearchResponse, RecommendationsResponse } from '../types/index.js';

export async function fetchSemanticScholarById(paperId: string): Promise<Paper | null> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperId)}?fields=paperId,title,authors,year,abstract,citationCount,externalIds,publicationVenue,fieldsOfStudy`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });

  if (res.status === 429) {
    throw new Error(
      'Semantic Scholar API rate limit reached. Please wait a few seconds and try again. ' +
      'Tip: arXiv IDs (ax_...) are often less rate-limited than Semantic Scholar IDs (ss_...).'
    );
  }
  if (!res.ok) return null;

  const p = (await res.json()) as SemanticScholarPaper;
  if (!p.paperId) return null; // Only skip if no ID at all

  return {
    id: `ss_${p.paperId}`,
    title: p.title || 'Untitled',
    authors: (p.authors || []).slice(0, 4).map((a) => a.name),
    year: p.year ?? null,
    abstract: p.abstract || 'Abstract not available for this paper.',
    citationCount: p.citationCount || 0,
    source: 'semantic_scholar',
    url: `https://www.semanticscholar.org/paper/${p.paperId}`,
    doi: p.externalIds?.DOI,
    journal: p.publicationVenue?.name,
    fieldsOfStudy: p.fieldsOfStudy || [],
  };
}

export async function searchSemanticScholar(query: string): Promise<Paper[]> {
  try {
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=paperId,title,authors,year,abstract,citationCount,externalIds,publicationVenue,fieldsOfStudy&limit=6`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });
    if (!res.ok) return [];
    
    const data = (await res.json()) as SemanticScholarResponse;
    return (data.data || [])
      .filter((p): p is SemanticScholarPaper & { abstract: string } => typeof p.abstract === 'string' && p.abstract.length > 50)
      .map((p) => ({
        id: `ss_${p.paperId}`,
        title: p.title || 'Untitled',
        authors: (p.authors || []).slice(0, 4).map((a) => a.name),
        year: p.year ?? null,
        abstract: p.abstract,
        citationCount: p.citationCount || 0,
        source: 'semantic_scholar' as const,
        url: `https://www.semanticscholar.org/paper/${p.paperId}`,
        doi: p.externalIds?.DOI,
        journal: p.publicationVenue?.name,
        fieldsOfStudy: p.fieldsOfStudy || [],
      }));
  } catch {
    return [];
  }
}

/** Converts a Quoriva-prefixed ID (e.g. ss_abc123, pm_12345, ax_2303.08774)
 * into a Semantic Scholar–compatible paper identifier. */
export function quorivaIdToSsId(quorivaId: string): string {
  if (quorivaId.startsWith('ss_')) return quorivaId.slice(3);
  if (quorivaId.startsWith('pm_')) return `PMID:${quorivaId.slice(3)}`;
  if (quorivaId.startsWith('ax_')) return `ArXiv:${quorivaId.slice(3)}`;
  return quorivaId; // assume raw SS ID if no prefix
}

/**
 * Maps a raw SS API paper object to the Quoriva Paper model.
 * Does NOT filter by abstract — citations/references commonly have null abstracts.
 * Only returns null if there is no paperId (i.e. the entry is completely unusable).
 */
function ssPaperToModel(p: SemanticScholarPaper): Paper | null {
  if (!p.paperId) return null;
  return {
    id: `ss_${p.paperId}`,
    title: p.title || 'Untitled',
    authors: (p.authors || []).slice(0, 4).map((a) => a.name),
    year: p.year ?? null,
    abstract: p.abstract || 'Abstract not available for this paper.',
    citationCount: p.citationCount || 0,
    source: 'semantic_scholar' as const,
    url: `https://www.semanticscholar.org/paper/${p.paperId}`,
    doi: p.externalIds?.DOI,
    journal: p.publicationVenue?.name,
    fieldsOfStudy: p.fieldsOfStudy || [],
  };
}

export async function fetchPaperCitations(quorivaId: string, limit = 10): Promise<Paper[]> {
  const ssId = quorivaIdToSsId(quorivaId);
  const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(ssId)}/citations?fields=paperId,title,authors,year,abstract,citationCount,externalIds,publicationVenue,fieldsOfStudy&limit=${limit}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });

  if (res.status === 429) {
    throw new Error('Semantic Scholar API rate limit reached. Please wait a few seconds and try again.');
  }
  if (!res.ok) {
    throw new Error(`Citations lookup failed (HTTP ${res.status}). Ensure the ID is valid. Tip: 'ss_' prefixed IDs work best.`);
  }

  const data = (await res.json()) as CitationsResponse;
  return (data.data || [])
    .map((entry) => ssPaperToModel(entry.citingPaper))
    .filter((p): p is Paper => p !== null);
}

export async function fetchPaperReferences(quorivaId: string, limit = 10): Promise<Paper[]> {
  const ssId = quorivaIdToSsId(quorivaId);
  const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(ssId)}/references?fields=paperId,title,authors,year,abstract,citationCount,externalIds,publicationVenue,fieldsOfStudy&limit=${limit}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });

  if (res.status === 429) {
    throw new Error('Semantic Scholar API rate limit reached. Please wait a few seconds and try again.');
  }
  if (!res.ok) {
    throw new Error(`References lookup failed (HTTP ${res.status}). Ensure the ID is valid. Tip: 'ss_' prefixed IDs work best.`);
  }

  const data = (await res.json()) as ReferencesResponse;
  return (data.data || [])
    .map((entry) => ssPaperToModel(entry.citedPaper))
    .filter((p): p is Paper => p !== null);
}

export async function fetchAuthorPapers(authorName: string, limit = 10): Promise<{ authorName: string; papers: Paper[] } | null> {
  try {
    // Step 1: Find the author
    const searchUrl = `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorName)}&fields=authorId,name,paperCount,citationCount,hIndex&limit=3`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });
    if (!searchRes.ok) return null;

    const searchData = (await searchRes.json()) as AuthorSearchResponse;
    const topAuthor = searchData.data?.[0];
    if (!topAuthor) return null;

    // Step 2: Fetch their papers
    const papersUrl = `https://api.semanticscholar.org/graph/v1/author/${topAuthor.authorId}/papers?fields=paperId,title,authors,year,abstract,citationCount,externalIds,publicationVenue,fieldsOfStudy&limit=${limit}`;
    const papersRes = await fetch(papersUrl, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });
    if (!papersRes.ok) return null;

    const papersData = await papersRes.json() as { data?: SemanticScholarPaper[] };
    const papers = (papersData.data || [])
      .map(ssPaperToModel)
      .filter((p): p is Paper => p !== null)
      .sort((a, b) => b.citationCount - a.citationCount);

    return { authorName: topAuthor.name, papers };
  } catch {
    return null;
  }
}

export async function fetchPaperRecommendations(quorivaId: string, limit = 10): Promise<Paper[]> {
  const ssId = quorivaIdToSsId(quorivaId);
  const url = `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${encodeURIComponent(ssId)}?fields=paperId,title,authors,year,abstract,citationCount,externalIds,publicationVenue,fieldsOfStudy&limit=${limit}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });

  if (res.status === 429) {
    throw new Error('Semantic Scholar API rate limit reached. Please wait a few seconds and try again.');
  }
  if (!res.ok) {
    throw new Error(`Recommendations lookup failed (HTTP ${res.status}). Recommendations require a valid Semantic Scholar paper — use an 'ss_' prefixed ID for best results.`);
  }

  const data = (await res.json()) as RecommendationsResponse;
  return (data.recommendedPapers || [])
    .map(ssPaperToModel)
    .filter((p): p is Paper => p !== null);
}
