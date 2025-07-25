import { MockEndpoint } from "@/lib/constants/endpoints.constants";

// Backend API response type
export interface BackendEndpoint {
  _id: string;
  name: string;
  method: string;
  endpoint: string;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
  description?: string;
  subDomain?: string;
  createdBy: string;
  collectionId: string;
  slugName: string;
  createdAt: string;
  updatedAt: string;
  requestHeaders?: any;
  request?: any;
}
import { apiWithTags } from "./baseApi";

export const mockApis = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    createMockApi: builder.mutation({
      query: (data) => ({
        url: `/mockets`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),
    getMocks: builder.query<BackendEndpoint[], { collectionId?: string }>({
      query: (params = {}) => ({
        url: `/mockets${params.collectionId ? `?collectionId=${params.collectionId}` : ''}`,
        method: "GET",
      }),
      providesTags: ["MOCKET_LIST"],
    }),
    createMockAiApi: builder.mutation({
      query: (data) => ({
        url: `/mockets/ai`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    getMocket: builder.query<MockEndpoint, string>({
      query: (id: string) => ({
        url: `/mockets/${id}`,
        method: "GET",
      }),
    }),

    updateMocket: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mockets/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    deleteMocket: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/mockets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    importFromSwagger: builder.mutation<BackendEndpoint[], { collectionId: string; swagger: object }>({
      query: ({ collectionId, swagger }) => ({
        url: `/mockets/generate-from-swagger`,
        method: "POST",
        body: { collectionId, swagger },
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    generateDescription: builder.mutation<{ success: boolean; updatedDescription: string }, string>({
      query: (id: string) => ({
        url: `/mockets/${id}/generate-description`,
        method: "POST",
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    generateHeaders: builder.mutation<{ success: boolean; updatedHeaders: Record<string, string> }, string>({
      query: (id: string) => ({
        url: `/mockets/${id}/generate-headers`,
        method: "POST",
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    generateRequestBody: builder.mutation<{ success: boolean; updatedBody: string }, string>({
      query: (id: string) => ({
        url: `/mockets/${id}/generate-request-body`,
        method: "POST",
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),

    generateResponseBody: builder.mutation<{ success: boolean; updatedBody: string }, string>({
      query: (id: string) => ({
        url: `/mockets/${id}/generate-response-body`,
        method: "POST",
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),
  }),
});

export const {
  useCreateMockAiApiMutation,
  useCreateMockApiMutation,
  useGetMocksQuery,
  useGetMocketQuery,
  useLazyGetMocketQuery,
  useLazyGetMocksQuery,
  useUpdateMocketMutation,
  useDeleteMocketMutation,
  useImportFromSwaggerMutation,
  useGenerateDescriptionMutation,
  useGenerateHeadersMutation,
  useGenerateRequestBodyMutation,
  useGenerateResponseBodyMutation,
} = mockApis;

export interface Endpoint {
  _id: string;
  collectionId: string;
  name: string;
  endpoint: string;
  requestType: string;
  description: string;
  responseBody: string;
  requestHeaders?: string; // optional JSON string for mock headers
  // Add other fields as needed
}

export const endpointApis = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    getEndpoints: builder.query<Endpoint[], { collectionId: string }>({
      query: ({ collectionId }) => ({
        url: `/mockets?collectionId=${collectionId}`,
        method: "GET",
      }),
      providesTags: ["MOCKET_LIST"],
    }),
    getEndpoint: builder.query<Endpoint, string>({
      query: (id: string) => ({
        url: `/mockets/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => ["MOCKET", { type: "MOCKET", id }],
    }),
    createEndpoint: builder.mutation<Endpoint, Partial<Endpoint>>({
      query: (data) => ({
        url: `/mockets`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),
    updateEndpoint: builder.mutation<Endpoint, { id: string; data: Partial<Endpoint> }>({
      query: ({ id, data }) => ({
        url: `/mockets/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["MOCKET_LIST", { type: "MOCKET", id }],
    }),
    deleteEndpoint: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/mockets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => ["MOCKET_LIST", { type: "MOCKET", id }],
    }),
    createEndpointAi: builder.mutation<Endpoint, Partial<Endpoint>>({
      query: (data) => ({
        url: `/mockets/ai`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MOCKET_LIST"],
    }),
  }),
});

export const {
  useGetEndpointsQuery,
  useGetEndpointQuery,
  useCreateEndpointMutation,
  useUpdateEndpointMutation,
  useDeleteEndpointMutation,
  useCreateEndpointAiMutation,
} = endpointApis;
