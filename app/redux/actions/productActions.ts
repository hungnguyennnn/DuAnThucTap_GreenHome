import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../configs/api';
import { 
  setPlants, 
  setPlantpots, 
  setAccessories, 
  setLoading, 
  setError,
  setSelectedProduct,
  setFilteredProducts,
  FilterType
} from '../slices/productSlice';

// Lấy danh sách tất cả sản phẩm
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Gọi API đồng thời để lấy 3 loại sản phẩm
      const [plantsRes, plantpotsRes, accessoriesRes] = await Promise.all([
        api.get('/products?type=plant'),
        api.get('/products?type=plantpot'),
        api.get('/products?type=accessory')
      ]);
      
      // Cập nhật dữ liệu vào Redux store
      dispatch(setPlants(plantsRes.data));
      dispatch(setPlantpots(plantpotsRes.data));
      dispatch(setAccessories(accessoriesRes.data));
      
      return {
        plants: plantsRes.data,
        plantpots: plantpotsRes.data,
        accessories: accessoriesRes.data
      };
    } catch (err) {
      console.error('Lỗi khi lấy sản phẩm:', err);
      dispatch(setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Lấy chi tiết một sản phẩm
export const fetchProductDetail = createAsyncThunk(
  'products/fetchDetail',
  async (productId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(setSelectedProduct(null)); // Reset sản phẩm đã chọn
      
      const response = await api.get(`/products/${productId}`);
      
      if (response.data) {
        dispatch(setSelectedProduct(response.data));
        return response.data;
      } else {
        dispatch(setError('Không tìm thấy sản phẩm!'));
        return null;
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
      dispatch(setError('Có lỗi xảy ra khi tải thông tin sản phẩm!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thiết lập danh sách sản phẩm cần hiển thị
export const setProductsToList = createAsyncThunk(
  'products/setProductsList',
  async (params: { productType: string, products?: any[] } | string, { dispatch, getState }) => {
    try {
      dispatch(setLoading(true));
      
      const state = getState() as any;
      let productsToDisplay = [];
      let productType = '';
      
      // Kiểm tra nếu params là đối tượng có chứa productType và products
      if (typeof params === 'object' && params.productType) {
        productType = params.productType;
        
        // Nếu có mảng products được cung cấp, sử dụng nó
        if (params.products && Array.isArray(params.products)) {
          productsToDisplay = params.products;
          dispatch(setFilteredProducts(productsToDisplay));
          return productsToDisplay;
        }
      } else if (typeof params === 'string') {
        productType = params;
      }
      
      // Xác định danh sách sản phẩm dựa vào loại
      if (productType === 'plant') {
        productsToDisplay = state.products.plants;
      } else if (productType === 'plantpot') {
        productsToDisplay = state.products.plantpots;
      } else if (productType === 'accessory') {
        productsToDisplay = state.products.accessories;
      } else if (Array.isArray(productType)) {
        // Nếu productType là một mảng, giả định đó là danh sách sản phẩm trực tiếp
        productsToDisplay = productType;
      }
      
      // Cập nhật danh sách sản phẩm được lọc
      dispatch(setFilteredProducts(productsToDisplay));
      
      return productsToDisplay;
    } catch (err) {
      console.error('Lỗi khi thiết lập danh sách sản phẩm:', err);
      dispatch(setError('Có lỗi xảy ra khi chuẩn bị danh sách sản phẩm!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
); 