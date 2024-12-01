import { z } from "zod";

export const tavilySearchSchema = z.object({
  query: z
    .string()
    .describe(
      "The main search query string to be used for searching information."
    ),

  options: z
    .object({
      searchDepth: z
        .enum(["basic", "advanced"])
        .default("basic")
        .describe(
          'Determines the depth of the search. "basic" provides quick, surface-level results, while "advanced" performs a more comprehensive search with deeper exploration.'
        ),

      topic: z
        .enum(["general", "news", "finance"])
        .default("general")
        .describe(
          "Specifies the search context or domain. Helps narrow down results to a specific type of information."
        ),

      maxResults: z
        .number()
        .default(1)
        .describe(
          "Maximum number of search results to return. Controls the volume of information retrieved."
        ),

      includeAnswer: z
        .boolean()
        .describe(
          "When true, attempts to generate a concise, direct answer to the query in addition to search results."
        ),

      includeImages: z
        .boolean()
        .describe(
          "When true, includes image results alongside text-based search results."
        ),

      includeImageDescriptions: z
        .boolean()
        .describe(
          "When true, provides descriptive text for the retrieved images, enhancing context and understanding."
        ),

      includeRawContent: z
        .boolean()
        .describe(
          "When true, returns the full, unprocessed content of search results, including original formatting and metadata."
        ),

      includeDomains: z
        .array(z.string())
        .describe(
          "An array of specific domains to include in the search results. Allows filtering to preferred or trusted sources."
        ),

      excludeDomains: z
        .array(z.string())
        .describe(
          "An array of domains to exclude from search results. Helps filter out unwanted or irrelevant sources."
        ),
    })
    .describe(
      "Configuration options for customizing the search parameters and result types."
    ),
});
