import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CLINIC_ADMIN' | 'PHYSICIAN' | 'NURSE' | 'DHN';
  clinicId: string;
  fullName: string;
  mustSetPassword: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const signInThunk = createAsyncThunk(
  'auth/signIn',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { signIn } = await import('@/modules/onboarding/service');
      return await signIn(credentials);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in failed');
    }
  }
);

export const { setUser, setToken, clearAuth, clearError } = authSlice.actions;

type StateWithAuth = { auth: AuthState };

export const selectCurrentUser = (state: StateWithAuth) => state.auth.user;
export const selectToken = (state: StateWithAuth) => state.auth.token;
export const selectIsAuthenticated = (state: StateWithAuth) => state.auth.token !== null;
export const selectAuthLoading = (state: StateWithAuth) => state.auth.isLoading;
export const selectAuthError = (state: StateWithAuth) => state.auth.error;

export default authSlice.reducer;
