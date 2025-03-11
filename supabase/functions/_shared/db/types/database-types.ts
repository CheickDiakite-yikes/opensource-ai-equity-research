
export interface SemanticSearchResult {
  doc_id: number;
  doc_type: 'transcript' | 'filing';
  symbol: string;
  date: string;
  title: string;
  relevance: number;
  content_snippet: string;
}

export interface RelatedDocument {
  doc_id: number;
  doc_type: 'transcript' | 'filing';
  symbol: string;
  date: string;
  title: string;
  similarity: number;
}
