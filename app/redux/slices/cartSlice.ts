import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from './productSlice';

// Định nghĩa interface cho CartItem
export interface CartItem {
  id: string;
  quantity: number;
  select: boolean;
}

// Định nghĩa interface cho CartState
interface CartState {
  cartId: string;
  items: CartItem[];
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Khởi tạo state ban đầu
const initialState: CartState = {
  cartId: '',
  items: [],
  products: [],
  loading: false,
  error: null,
};

// Tạo slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCartId: (state, action: PayloadAction<string>) => {
      state.cartId = action.payload;
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    setCartProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    toggleSelectItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.map(item => 
        item.id === id ? { ...item, select: !item.select } : item
      );
    },
    updateItemQuantity: (state, action: PayloadAction<{id: string, change: number}>) => {
      const { id, change } = action.payload;
      state.items = state.items.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      );
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
});

// Export actions và reducer
export const { 
  setLoading, 
  setError, 
  setCartId, 
  setCartItems, 
  setCartProducts,
  toggleSelectItem,
  updateItemQuantity,
  removeItem,
  clearCart
} = cartSlice.actions;
export default cartSlice.reducer; 