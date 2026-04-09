export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string;
  citationCount: number;
  source: 'semantic_scholar' | 'pubmed' | 'arxiv';
  url: string;
  doi?: string;
  journal?: string;
  fieldsOfStudy?: string[];
}

export interface SemanticScholarAuthor {
  name: string;
}

export interface SemanticScholarPaper {
  paperId: string;
  title?: string;
  authors?: SemanticScholarAuthor[];
  year?: number;
  abstract?: string;
  citationCount?: number;
  externalIds?: { DOI?: string };
  publicationVenue?: { name?: string };
  fieldsOfStudy?: string[];
}

export interface SemanticScholarResponse {
  data?: SemanticScholarPaper[];
}

export interface CitationEntry {
  citingPaper: SemanticScholarPaper;
}

export interface CitationsResponse {
  data?: CitationEntry[];
}

export interface ReferenceEntry {
  citedPaper: SemanticScholarPaper;
}

export interface ReferencesResponse {
  data?: ReferenceEntry[];
}

export interface AuthorInfo {
  authorId: string;
  name: string;
  paperCount?: number;
  citationCount?: number;
  hIndex?: number;
}

export interface AuthorSearchResponse {
  data?: AuthorInfo[];
}

export interface RecommendationsResponse {
  recommendedPapers?: SemanticScholarPaper[];
}
