declare module "bun" {
  interface Env {
    SESSION_NAME: string

    ENABLE_AGENTS: string

    TAVILY_API_KEY: string;

    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;

    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;

    GOOGLE_GENERATIVE_AI_API_KEY: string;
    GROQ_API_KEY: string;

    SERPER_API_KEY: string;
  }
}
