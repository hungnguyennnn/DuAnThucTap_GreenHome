import { Dispatch } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../configs/api';
import {
  setSearchResults,
  setSearchHistory,
  setLoading,
  setError,
} from '../slices/searchSlice';

const SEARCH_HISTORY_KEY = '@search_history';

export const searchProducts = (keyword: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await api.get(`/products/search?q=${keyword}`);
    dispatch(setSearchResults(response.data));

    // Lưu từ khóa tìm kiếm vào lịch sử
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    let searchHistory = history ? JSON.parse(history) : [];
    
    // Thêm từ khóa mới vào đầu mảng nếu chưa tồn tại
    if (!searchHistory.includes(keyword)) {
      searchHistory = [keyword, ...searchHistory].slice(0, 10); // Giới hạn 10 từ khóa
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
      dispatch(setSearchHistory(searchHistory));
    }
  } catch (error) {
    dispatch(setError('Có lỗi xảy ra khi tìm kiếm sản phẩm'));
    console.error('Search error:', error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadSearchHistory = () => async (dispatch: Dispatch) => {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      dispatch(setSearchHistory(JSON.parse(history)));
    }
  } catch (error) {
    console.error('Load search history error:', error);
  }
};

export const clearSearchHistory = () => async (dispatch: Dispatch) => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    dispatch(setSearchHistory([]));
  } catch (error) {
    console.error('Clear search history error:', error);
  }
}; 