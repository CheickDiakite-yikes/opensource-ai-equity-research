
// Types related to news and articles

/**
 * Company news article
 */
export interface NewsArticle {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}
