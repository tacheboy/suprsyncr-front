// src/store/slices/uiSlice.ts
// UI state management (sidebar, modals, etc.)

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
}

const initialState: UiState = {
  sidebarOpen: true,
  activeModal: null,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    
    closeModal(state) {
      state.activeModal = null;
    },
    
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
