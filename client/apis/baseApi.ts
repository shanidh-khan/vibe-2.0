import { RootState } from "@/store/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth;
      // const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  endpoints: () => ({}),
});

const apiWithTags = baseApi.enhanceEndpoints({
  addTagTypes: ["MOCKET_LIST", "MOCKET", "COLLECTION_LIST", "COLLECTION"],
});

export { apiWithTags };
