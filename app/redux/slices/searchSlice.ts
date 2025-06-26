import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from './productSlice';

interface SearchState {
  searchTerm: string;
  searchResults: Product[];
  searchHistory: string[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  searchTerm: '',
  searchResults: [],
  searchHistory: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Product[]>) => {
      state.searchResults = action.payload;
    },
    setSearchHistory: (state, action: PayloadAction<string[]>) => {
      state.searchHistory = action.payload;
    },
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      // Chỉ thêm vào lịch sử nếu chưa tồn tại
      if (!state.searchHistory.includes(action.payload)) {
        state.searchHistory.unshift(action.payload);
        // Giới hạn lịch sử tìm kiếm tối đa 10 mục
        if (state.searchHistory.length > 10) {
          state.searchHistory.pop();
        }
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
});

export const {
  setSearchTerm,
  setLoading,
  setError,
  setSearchResults,
  setSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  clearSearchResults
} = searchSlice.actions;

export default searchSlice.reducer; 