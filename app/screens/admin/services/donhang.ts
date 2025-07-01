import { Alert } from 'react-native';
import { API_CONFIG } from '../../../ApiService';
import api from '../../../configs/api'

// Cập nhật type Order để match với dữ liệu thực tế từ API
export type Order = {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    quantity: number;
    price: string;
    name: string;
  }>;
  total: number;
  shippingFee: number;
  deliveryMethod: number;
  payMethod: number;
  address: string;
  phone: string;
  status: 'pending' | 'completed';
  createdAt: string;
  
  // Computed properties để backward compatibility
  fullName?: string;
  phoneNumber?: string;
  totalPrice?: string;
  paymentMethod?: 'cod' | 'transfer';
  products?: Array<{
    id: string;
    quantity: number;
    price: string;
    name: string;
  }>;
};

// Lấy tất cả đơn hàng
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/orders`);
    const data = await response.json();
    
    // Transform data để match với interface cũ
    const transformedData = data.map((order: any) => ({
      ...order,
      fullName: `Khách hàng ${order.userId}`, // Fallback nếu không có tên
      phoneNumber: order.phone,
      totalPrice: (order.total + order.shippingFee).toLocaleString('vi-VN') + 'đ',
      paymentMethod: order.payMethod === 1 ? 'cod' : 'transfer',
      products: order.items
    }));
    
    console.log('📦 Orders loaded:', transformedData.length);
    return transformedData;
  } catch (error) {
    console.error('Lỗi khi tải đơn hàng:', error);
    return [];
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    // Lấy lại đơn hàng gốc từ API
    const getResponse = await api.get(`/orders/${orderId}`);
    const existingOrder = getResponse.data;

    if (!existingOrder) {
      console.error('Không tìm thấy đơn hàng');
      return false;
    }

    // Tạo bản sao đơn hàng với trạng thái mới
    const updatedOrder = { ...existingOrder, status: newStatus };

    // Gửi bản cập nhật lên server (dùng PUT hoặc PATCH nếu backend hỗ trợ)
    const updateResponse = await api.put(`/orders/${orderId}`, updatedOrder);
    return updateResponse.status === 200;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật trạng thái đơn hàng:', error);
    return false;
  }
};


// Dịch trạng thái đơn hàng
export const translateOrderStatus = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Đang xử lý';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

// Dịch phương thức thanh toán
export const translatePaymentMethod = (payMethod: number): string => {
  switch (payMethod) {
    case 1:
      return 'Tiền mặt khi nhận hàng';
    case 2:
      return 'Chuyển khoản';
    default:
      return 'Không xác định';
  }
};

// Dịch phương thức giao hàng
export const translateDeliveryMethod = (deliveryMethod: number): string => {
  switch (deliveryMethod) {
    case 1:
      return 'Giao hàng tận nơi';
    case 2:
      return 'Nhận tại cửa hàng';
    default:
      return 'Không xác định';
  }
};