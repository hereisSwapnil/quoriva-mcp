import { Paper } from '../types/index.js';

export function parseArXivEntries(xml: string): Paper[] {
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  const papers: Paper[] = [];

  for (const entry of entryMatches) {
    const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = entry.match(/<published>(\d{4})-\d{2}-\d{2}T/);
    const doiMatch = entry.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/);
    const categoryMatches = [...entry.matchAll(/<category[^>]*term="([^"]+)"/g)];
    const authorMatches = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g)];

    const abstract = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
    if (!abstract || abstract.length < 50) continue;

    const rawId = idMatch ? idMatch[1].trim() : '';
    const arxivId = rawId.split('/').pop() || rawId;
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Untitled';

    papers.push({
      id: `ax_${arxivId}`,
      title,
      authors: authorMatches.slice(0, 4).map((m) => m[1].replace(/\s+/g, ' ').trim()),
      year: publishedMatch ? parseInt(publishedMatch[1], 10) : null,
      abstract,
      citationCount: 0,
      source: 'arxiv',
      url: rawId || `https://arxiv.org/abs/${arxivId}`,
      doi: doiMatch ? doiMatch[1].trim() : undefined,
      journal: 'arXiv',
      fieldsOfStudy: categoryMatches.slice(0, 3).map((m) => m[1]),
    });
  }

  return papers;
}

export async function fetchArXivById(arxivId: string): Promise<Paper | null> {
  try {
    const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}&max_results=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });
    if (!res.ok) return null;

    const xml = await res.text();
    const papers = parseArXivEntries(xml);
    return papers[0] || null;
  } catch {
    return null;
  }
}

export async function searchArXiv(query: string): Promise<Paper[]> {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=4&sortBy=relevance&sortOrder=descending`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Quoriva-MCP/1.0' } });
    if (!res.ok) return [];
    
    const xml = await res.text();
    return parseArXivEntries(xml);
  } catch {
    return [];
  }
}
