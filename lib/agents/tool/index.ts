import { tool, type CoreTool } from "ai";
import { z } from "zod";
import { tavilySearchSchema } from "./schema";
import { logger } from "@/lib/utils/logger";
import { TavilyCLient } from "./api/tavily";

const TAVILY_TOOL_DESCRIPTION = `Tavily Search is an intelligent web search tool designed to retrieve accurate, up-to-date information across multiple domains. Key capabilities include:

- Perform dynamic web searches with configurable depth and topic specificity
- Retrieve comprehensive results from diverse online sources
- Generate direct answers to queries when possible
- Optional image search and retrieval
- Flexible domain inclusion/exclusion for targeted research
- Supports general, news, and finance-related searches
- Configurable result volume and content type

Use this tool when you need to:
- Gather real-time information on current events
- Research specific topics with customizable search parameters
- Obtain quick, relevant answers from web sources
- Cross-reference information from multiple domains
- Support fact-checking and information verification processes

Best practices:
- Specify clear, concise search queries
- Utilize topic and domain filters for precision
- Adjust search depth based on information complexity
- Review and validate retrieved information

The tool is particularly useful for tasks requiring current, web-based research and information synthesis.`;

export const coreModelTool = {
  search: tool({
    description: "A tool that can access data from outside sources",
    parameters: tavilySearchSchema,
    execute: async ({ query, options }) => {
      logger.info(`Using Tavily Search for query: ${query}`);

      const tvly = new TavilyCLient();

      return await tvly.search(query, options);
    },
  }),
};
