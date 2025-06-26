import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa interface cho Product
export interface Product {
  id: string;
  name: string;
  price: string;
  images: string[];
  size: string;
  quantity: number;
  origin: string;
  character?: string;
  new?: boolean;
  type: string;
}

// Định nghĩa loại filter
export enum FilterType {
  ALL = 1,
  NEW = 2,
  SHADE = 3,
  LIGHT = 4
}

// Định nghĩa interface cho state products
interface ProductState {
  plants: Product[];
  plantpots: Product[];
  accessories: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  selectedFilter: FilterType;
  loading: boolean;
  error: string | null;
}

// Khởi tạo state ban đầu
const initialState: ProductState = {
  plants: [],
  plantpots: [],
  accessories: [],
  filteredProducts: [],
  selectedProduct: null,
  selectedFilter: FilterType.ALL,
  loading: false,
  error: null,
};

// Tạo slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPlants: (state, action: PayloadAction<Product[]>) => {
      state.plants = action.payload;
    },
    setPlantpots: (state, action: PayloadAction<Product[]>) => {
      state.plantpots = action.payload;
    },
    setAccessories: (state, action: PayloadAction<Product[]>) => {
      state.accessories = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilteredProducts: (state, action: PayloadAction<Product[]>) => {
      state.filteredProducts = action.payload;
    },
    setSelectedFilter: (state, action: PayloadAction<FilterType>) => {
      state.selectedFilter = action.payload;
      
      // Áp dụng bộ lọc tương ứng
      let productsToFilter: Product[] = [];
      
      // Xác định danh sách cần lọc dựa vào sản phẩm đã lọc trước đó (để giữ đúng loại sản phẩm)
      if (state.filteredProducts.length > 0) {
        // Lấy loại sản phẩm từ sản phẩm đầu tiên trong danh sách đã lọc
        const productType = state.filteredProducts[0]?.type;
        
        if (productType === 'plant') {
          productsToFilter = state.plants;
        } else if (productType === 'plantpot') {
          productsToFilter = state.plantpots;
        } else if (productType === 'accessory') {
          productsToFilter = state.accessories;
        }
      }
      
      // Nếu không có sản phẩm nào để lọc, không thay đổi state
      if (productsToFilter.length === 0) {
        return;
      }
      
      // Áp dụng bộ lọc
      switch (action.payload) {
        case FilterType.ALL:
          state.filteredProducts = productsToFilter;
          break;
        case FilterType.NEW:
          state.filteredProducts = productsToFilter.filter(item => item.new === true);
          break;
        case FilterType.SHADE:
          state.filteredProducts = productsToFilter.filter(
            item => item.character && item.character.toLowerCase() === 'ưa bóng'
          );
          break;
        case FilterType.LIGHT:
          state.filteredProducts = productsToFilter.filter(
            item => item.character && item.character.toLowerCase() === 'ưa sáng'
          );
          break;
        default:
          state.filteredProducts = productsToFilter;
      }
    }
  },
});

// Export actions và reducer
export const { 
  setPlants, 
  setPlantpots, 
  setAccessories, 
  setLoading, 
  setError,
  setSelectedProduct,
  setFilteredProducts,
  setSelectedFilter
} = productSlice.actions;
export default productSlice.reducer; 