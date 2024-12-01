import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { tool, type CoreMessage, generateText } from "ai";
import { z } from "zod";
import { getEnv } from "../env";
import { coreModelTool } from "./tool";

export interface LLMOption {
  systemInstruction?: string;
  maxSteps?: number;
  enableTool?: boolean;
  maxRetries?: number;
}

const SYSTEM_INSTRUCT = `You are very helpfull Assistant!`;

export class Agents {
  private google_apikey: string;
  private groq_apikey: string;

  constructor() {
    this.google_apikey = getEnv("GOOGLE_GENERATIVE_AI_API_KEY");
    this.groq_apikey = getEnv("GROQ_API_KEY");
    this.checkEnv();
  }

  private checkEnv() {
    if (!this.google_apikey || !this.groq_apikey) {
      throw new Error("Apikey for Google and Groq is not available!");
    }
  }

  private modelTool() {
    return coreModelTool;
  }

  async googleModel(userMessages: CoreMessage[], option?: LLMOption) {
    const modelResponse = await generateText({
      model: google("gemini-1.5-pro"),
      system: option?.systemInstruction ?? SYSTEM_INSTRUCT,
      maxSteps: option?.maxSteps ?? 4,
      maxRetries: option?.maxRetries ?? 2,
      messages: userMessages,
      tools: option?.enableTool ? this.modelTool() : undefined,
    });
    return modelResponse;
  }

  async groqModel(userMessages: CoreMessage[], option?: LLMOption) {
    const modelResponse = await generateText({
      model: groq("llama-3.2-90b-vision-preview"),
      system: option?.systemInstruction ?? SYSTEM_INSTRUCT,
      maxSteps: option?.maxSteps ?? 4,
      maxRetries: option?.maxRetries ?? 2,
      messages: userMessages,
      tools: option?.enableTool ? this.modelTool() : undefined,
    });

    return modelResponse;
  }
}
