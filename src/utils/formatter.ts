import { Paper } from '../types/index.js';

export function formatPaper(p: Paper, idx?: number): string {
  const prefix = idx !== undefined ? `${idx + 1}. ` : '';
  const authors = p.authors.length > 0 ? p.authors.join(', ') : 'Unknown authors';
  const fields = p.fieldsOfStudy && p.fieldsOfStudy.length > 0 ? p.fieldsOfStudy.join(', ') : 'N/A';
  const journal = p.journal ? `\n   - Journal: ${p.journal}` : '';
  const doi = p.doi ? `\n   - DOI: ${p.doi}` : '';

  return (
    `${prefix}**${p.title}** (${p.year || 'Unknown Year'})\n` +
    `   - ID: ${p.id}\n` +
    `   - Source: Quoriva ${p.source.toUpperCase()}\n` +
    `   - Authors: ${authors}\n` +
    `   - Citations: ${p.citationCount.toLocaleString()}\n` +
    `   - Fields: ${fields}` +
    journal +
    doi +
    `\n   - URL: ${p.url}\n` +
    `   - Abstract: ${p.abstract}`
  );
}

export function formatPaperList(papers: Paper[], header: string): string {
  if (papers.length === 0) {
    return `${header}\n\nNo results found.`;
  }
  const list = papers.map((p, i) => formatPaper(p, i)).join('\n\n');
  return `${header}\n\n${list}`;
}
