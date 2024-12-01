import { tavily } from "@tavily/core";
import type {
  TavilyClient,
  TavilyClientOptions,
  TavilySearchOptions,
  TavilySearchResponse,
  TavilySearchContextResponse,
} from "./tavily.types";

export class TavilyCLient {
  private client: TavilyClient;

  constructor(options?: TavilyClientOptions) {
    this.client = tavily({
      apiKey: process.env.TAVILY_API_KEY ?? options?.apiKey,
    });
  }

  async search(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<TavilySearchResponse> {
    try {
      if (!query.trim()) {
        throw new Error("Search query cannot be empty");
      }

      const response = await this.client.search(query, options);

      if (!response.results?.length) {
        console.warn(`No results found for query: ${query}`);
      }

      return {
        ...response,
      };
    } catch (error) {
      console.error("Search failed:", error);
      throw new Error(
        `Search operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async searchContext(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<TavilySearchContextResponse[]> {
    try {
      if (!query.trim()) {
        throw new Error("Context search query cannot be empty");
      }

      const result = await this.client.searchContext(query, options);

      if (!result) {
        console.warn(`No context found for query: ${query}`);
      }

      const context = JSON.parse(JSON.parse(result));

      return context;
    } catch (error) {
      console.error("Context search failed:", error);
      throw new Error(
        `Context search operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async searchQNA(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<string> {
    try {
      if (!query.trim()) {
        throw new Error("QnA search query cannot be empty");
      }

      const answer = await this.client.searchQNA(query, options);

      if (!answer) {
        console.warn(`No answer found for query: ${query}`);
      }

      return answer;
    } catch (error) {
      console.error("QnA search failed:", error);
      throw new Error(
        `QnA search operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async extract(urls: string[]) {
    return this.client.extract(urls);
  }
}
