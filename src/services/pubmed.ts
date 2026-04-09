import { Paper } from '../types/index.js';

export function parsePubMedArticles(xml: string, minAbstractLength = 50): Paper[] {
  const papers: Paper[] = [];
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  for (const article of articleMatches) {
    const titleMatch = article.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/);
    const abstractMatch = article.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
    const pmidMatch = article.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    const yearMatch = article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
    const journalMatch = article.match(/<Title>([\s\S]*?)<\/Title>/);
    const authorMatches = [...article.matchAll(/<LastName>([\s\S]*?)<\/LastName>[\s\S]*?<ForeName>([\s\S]*?)<\/ForeName>/g)];
    const doiMatch = article.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/);

    const abstract = abstractMatch ? abstractMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    if (abstract.length < minAbstractLength) continue;

    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : 'Untitled';
    const pmid = pmidMatch ? pmidMatch[1] : '';
    if (!pmid) continue;

    papers.push({
      id: `pm_${pmid}`,
      title,
      authors: authorMatches.slice(0, 4).map((m) => `${m[1]} ${m[2]}`),
      year: yearMatch ? parseInt(yearMatch[1], 10) : null,
      abstract,
      citationCount: 0,
      source: 'pubmed',
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      doi: doiMatch ? doiMatch[1] : undefined,
      journal: journalMatch ? journalMatch[1] : undefined,
      fieldsOfStudy: ['Medicine', 'Biology'],
    });
  }

  return papers;
}

export async function fetchPubMedById(pmid: string): Promise<Paper | null> {
  try {
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${encodeURIComponent(pmid)}&retmode=xml`;
    const fetchRes = await fetch(fetchUrl);
    if (!fetchRes.ok) return null;

    const xml = await fetchRes.text();
    // Use minAbstractLength=0 for direct lookups — we want the paper even if abstract is missing/short
    const papers = parsePubMedArticles(xml, 0);
    return papers[0] || null;
  } catch {
    return null;
  }
}

export async function searchPubMed(query: string): Promise<Paper[]> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=4&sort=relevance&retmode=json`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    
    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
    const fetchRes = await fetch(fetchUrl);
    if (!fetchRes.ok) return [];
    
    const xml = await fetchRes.text();
    return parsePubMedArticles(xml);
  } catch {
    return [];
  }
}
