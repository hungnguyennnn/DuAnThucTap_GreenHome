import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../configs/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  setLoading, 
  setError, 
  setCartId, 
  setCartItems, 
  setCartProducts,
  CartItem
} from '../slices/cartSlice';

// Lấy giỏ hàng của user
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        dispatch(setError('Bạn chưa đăng nhập'));
        return null;
      }
      
      const response = await api.get(`/cart?userId=${userId}`);
      
      if (response.data && response.data.length > 0) {
        dispatch(setCartItems(response.data[0].items));
        dispatch(setCartId(response.data[0].id));
        return {
          cartId: response.data[0].id,
          items: response.data[0].items
        };
      } else {
        dispatch(setCartItems([]));
        dispatch(setCartId(''));
        return {
          cartId: '',
          items: []
        };
      }
    } catch (err) {
      console.error('Lỗi khi lấy giỏ hàng:', err);
      dispatch(setError('Không thể tải giỏ hàng. Vui lòng thử lại!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Lấy danh sách sản phẩm trong giỏ hàng
export const fetchCartProducts = createAsyncThunk(
  'cart/fetchCartProducts',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const response = await api.get('/products');
      
      if (response.data) {
        dispatch(setCartProducts(response.data));
        return response.data;
      } else {
        dispatch(setError('Không thể tải sản phẩm'));
        return null;
      }
    } catch (err) {
      console.error('Lỗi khi lấy sản phẩm:', err);
      dispatch(setError('Không thể tải sản phẩm. Vui lòng thử lại!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Cập nhật giỏ hàng
export const updateCartItems = createAsyncThunk(
  'cart/updateCartItems',
  async ({ cartId, items }: { cartId: string, items: CartItem[] }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      if (!cartId) {
        dispatch(setError('Không tìm thấy giỏ hàng'));
        return null;
      }
      
      await api.patch(`/cart/${cartId}`, { items });
      dispatch(setCartItems(items));
      
      return items;
    } catch (err) {
      console.error('Lỗi khi cập nhật giỏ hàng:', err);
      dispatch(setError('Không thể cập nhật giỏ hàng. Vui lòng thử lại!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Xóa toàn bộ giỏ hàng
export const clearCartItems = createAsyncThunk(
  'cart/clearCartItems',
  async (cartId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      if (!cartId) {
        dispatch(setError('Không tìm thấy giỏ hàng'));
        return false;
      }
      
      await api.patch(`/cart/${cartId}`, { items: [] });
      dispatch(setCartItems([]));
      
      return true;
    } catch (err) {
      console.error('Lỗi khi xóa giỏ hàng:', err);
      dispatch(setError('Không thể xóa giỏ hàng. Vui lòng thử lại!'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }
); 