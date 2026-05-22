import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  globalLoading: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  globalLoading: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const { setSidebarOpen, toggleSidebar, setActiveModal, setGlobalLoading } = uiSlice.actions;

type StateWithUI = { ui: UIState };

export const selectSidebarOpen = (state: StateWithUI) => state.ui.sidebarOpen;
export const selectActiveModal = (state: StateWithUI) => state.ui.activeModal;
export const selectGlobalLoading = (state: StateWithUI) => state.ui.globalLoading;

export default uiSlice.reducer;
