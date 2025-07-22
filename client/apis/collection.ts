import { apiWithTags } from "./baseApi";

// Types
export interface Collection {
  _id: string;
  name: string;
  baseUrl: string;
  description: string;
  apiKey?: string;
  subDomain?: string;
  createdBy?: string;
  numberOfRequests?: number;
}

export const collectionApis = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    getCollections: builder.query<Collection[], void>({
      query: () => ({
        url: "/collections",
        method: "GET",
      }),
      providesTags: ["COLLECTION_LIST"],
    }),
    getCollection: builder.query<Collection, string>({
      query: (id: string) => ({
        url: `/collections/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => ["COLLECTION", { type: "COLLECTION", id }],
    }),
    createCollection: builder.mutation<Collection, Partial<Collection>>({
      query: (data) => ({
        url: "/collections",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["COLLECTION_LIST"],
    }),
    updateCollection: builder.mutation<Collection, { id: string; data: Partial<Collection> }>({
      query: ({ id, data }) => ({
        url: `/collections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["COLLECTION_LIST", { type: "COLLECTION", id }],
    }),
    deleteCollection: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => ["COLLECTION_LIST", { type: "COLLECTION", id }],
    }),
  }),
});

export const {
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} = collectionApis;
