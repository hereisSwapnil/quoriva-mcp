import { Paper } from '../types/index.js';
import { searchSemanticScholar, fetchSemanticScholarById } from './semanticScholar.js';
import { searchPubMed, fetchPubMedById } from './pubmed.js';
import { searchArXiv, fetchArXivById } from './arxiv.js';

export function parseSupportedPaperUrl(raw: string): { source: Paper['source']; id: string } | null {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split('/').filter(Boolean);

    if (host.includes('semanticscholar.org') && segments.includes('paper')) {
      const id = segments[segments.length - 1];
      if (id) return { source: 'semantic_scholar', id };
    }

    if (host.includes('pubmed.ncbi.nlm.nih.gov')) {
      const id = segments[0];
      if (id && /^\d+$/.test(id)) return { source: 'pubmed', id };
    }

    if (host.includes('arxiv.org')) {
      const first = segments[0];
      const second = segments[1] || '';
      if ((first === 'abs' || first === 'pdf' || first === 'html') && second) {
        const clean = second.replace(/\.pdf$/i, '');
        return { source: 'arxiv', id: clean };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchPaperFromUrl(raw: string): Promise<Paper | null> {
  const parsed = parseSupportedPaperUrl(raw);
  if (!parsed) return null;

  if (parsed.source === 'semantic_scholar') return fetchSemanticScholarById(parsed.id);
  if (parsed.source === 'pubmed') return fetchPubMedById(parsed.id);
  return fetchArXivById(parsed.id);
}

export async function executeParallelSearch(q: string): Promise<Paper[]> {
  const directPaper = await fetchPaperFromUrl(q);
  const query = directPaper?.title || q;

  // Added console logging for server debug capabilities via Quoriva
  // console.error(`[QUORIVA-MCP] Using query: "${query}"`);

  const [ssPapers, pmPapers, axPapers] = await Promise.all([
    searchSemanticScholar(query),
    searchPubMed(query),
    searchArXiv(query),
  ]);

  const seen = new Set<string>();
  const papers: Paper[] = [];
  
  for (const p of [directPaper, ...ssPapers, ...pmPapers, ...axPapers]) {
    if (!p) continue;
    const dedupeKey = p.title.toLowerCase().slice(0, 40);
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      papers.push(p);
    }
  }

  papers.sort((a, b) => b.citationCount - a.citationCount);
  return papers;
}
