/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  userDetails: any | null;
  authenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  token: null,
  userDetails: null,
  authenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.authenticated = !!action.payload;
    },
    setUserDetails: (state, action: PayloadAction<any | null>) => {
      state.userDetails = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.userDetails = null;
      state.authenticated = false;
    },
  },
  //  extraReducers: (builder) => {
  //     builder.addMatcher(
  //       authApis.endpoints.getProfile.matchFulfilled,
  //       (state, action) => {

  //       }
  //     );
  //   },
});

export const { setToken, setUserDetails, setLoading, logout } =
  authSlice.actions;
export default authSlice.reducer;
