import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../configs/api';
import { 
  setLoading, 
  setError, 
  setCurrentOrder,
  setPaymentSuccess,
  setOrders,
  addToOrderHistory,
  OrderItem
} from '../slices/paymentSlice';
import { clearCartItems } from './cartActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store/store';

// Tạo đơn hàng mới
export const createOrder = createAsyncThunk(
  'payment/createOrder',
  async (orderData: Omit<OrderItem, 'id' | 'createdAt' | 'status'>, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      
      // Tạo đơn hàng với trạng thái là 'pending'
      const newOrder = {
        ...orderData,
        id: `OR${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const response = await api.post('/orders', newOrder);
      
      
      if (response.data) {
        dispatch(setCurrentOrder(response.data));
        // Đánh dấu thanh toán thành công sau khi tạo đơn hàng
        dispatch(setPaymentSuccess(true));
        
        return response.data;
      } else {
        dispatch(setError('Không thể tạo đơn hàng!'));
       
        return null;
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      dispatch(setError('Có lỗi xảy ra khi tạo đơn hàng!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Xử lý thanh toán
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async ({ 
    orderId, 
    cartId 
  }: { 
    orderId: string, 
    cartId: string 
  }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Lấy thông tin đơn hàng
      const orderResponse = await api.get(`/orders/${orderId}`);
      
      if (!orderResponse.data) {
        dispatch(setError('Không tìm thấy đơn hàng!'));
        return null;
      }
      
      // Cập nhật trạng thái đơn hàng thành 'completed'
      const updatedOrder = {
        ...orderResponse.data,
        status: 'completed'
      };
      
      await api.patch(`/orders/${orderId}`, { status: 'completed' });
      
      // Xóa các sản phẩm trong giỏ hàng
      if (cartId) {
        await dispatch(clearCartItems(cartId));
      }
      
      // Thêm vào danh sách thông báo
      dispatch(addToOrderHistory(updatedOrder));
      dispatch(setPaymentSuccess(true));
      
      return updatedOrder;
    } catch (err) {
      console.error('Lỗi khi xử lý thanh toán:', err);
      dispatch(setError('Có lỗi xảy ra khi xử lý thanh toán!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const NO_IMAGE = "https://vanchuyentrungquoc247.com/wp-content/uploads/2015/04/icon-giao-hang.png";

const getProductImage = async (productId: string) => {
    try {

        const res = await api.get(`/products/${productId}`);   
        if (!res.data || !res.data.images || !res.data.images.length) {
            return NO_IMAGE;
        }
        
        return res.data.images[0];
    } catch (error) {
        console.error('Lỗi khi tải ảnh sản phẩm:', error);
        return NO_IMAGE;
    }
};

export const fetchOrderHistory = createAsyncThunk(
  'payment/fetchOrderHistory',
  async (_, { getState, dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      // Lấy thông tin người dùng đã đăng nhập
      const { user } = (getState() as RootState).auth;
      
      if (!user || !user.id) {
        dispatch(setError('Bạn cần đăng nhập để xem lịch sử đơn hàng'));
        dispatch(setLoading(false));
        return;
      }
      
      // Lấy đơn hàng theo userId
      const response = await api.get(`/orders?userId=${user.id}`);
      
      if (response && response.data) {
        // Sắp xếp theo thời gian mới nhất
        const sortedOrders = response.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        dispatch(setOrders(sortedOrders));
      } else {
        dispatch(setOrders([]));
      }
      
      dispatch(setLoading(false));
    } catch (error) {
      console.error('Error fetching order history:', error);
      dispatch(setError('Không thể tải lịch sử đơn hàng'));
      dispatch(setLoading(false));
    }
  }
); 