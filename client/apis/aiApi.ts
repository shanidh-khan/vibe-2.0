import { apiWithTags } from "./baseApi";

// Types for AI endpoint generation (matching backend response)
export interface MocketEndpoint {
  name: string;
  method: string;
  endpoint: string;
  requestHeaders: Record<string, unknown>;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  slugName: string;
  description: string;
}

export interface ApiGenerationResponse {
  success: boolean;
  data: {
    endpoints: MocketEndpoint[];
    collectionName: string;
    description: string;
  };
}

export const aiApis = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    generateApiEndpoints: builder.mutation<ApiGenerationResponse, { description: string; collectionId: string }>({
      query: (data) => ({
        url: `/mockets/ai`,
        method: "POST",
        body: data,
      }),
    }),
    generateSingleEndpoint: builder.mutation<MocketEndpoint, { method: string; path: string; description: string }>({
      query: (data) => ({
        url: `/ai/generate-single-endpoint`,
        method: "POST",
        body: data,
      }),
    }),
    aiHealthCheck: builder.query<{ success: boolean; message: string; timestamp: string }, void>({
      query: () => ({
        url: `/ai/health`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGenerateApiEndpointsMutation,
  useGenerateSingleEndpointMutation,
  useAiHealthCheckQuery,
} = aiApis;