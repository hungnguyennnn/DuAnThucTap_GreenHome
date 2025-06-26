import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import api from '../configs/api';
import PaymentItem from '../components/PaymentItem';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderHistory } from '../redux/actions/paymentActions';
import { clearCart } from '../redux/slices/cartSlice';
import { RootState } from '../redux/store/store';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { resetPaymentState, addToOrderHistory } from '../redux/slices/paymentSlice';
import notificationService from '../utils/NotificationService';


interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CartItem {
  id: string;
  quantity: number;
}

interface ProductType {
  id: string;
  name: string;
  price: number;
  images: string[];
  size: string;
  origin: string;
  character: string;
  quantityInCart?: number;
}

interface OrderDetails {
  id: string;
  status: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    price: string;
    quantity: number;
  }[];
  total: number;
  shippingFee: number;
  deliveryMethod: number;
  payMethod: number;
  address: string;
  phone: string;
  userId: string;
  productImage?: string;
}

interface PaymentSuccessProps {
  navigation: any;
  route: {
    params: {
      user: User;
      payMethod: number;
      total: number;
      deliveryMethod: number;
      cartId: string;
      orderId?: string;
      fromAfterPayment?: boolean;
    };
  };
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { loading, currentOrder } = useSelector((state: RootState) => state.payment);
  const { user, payMethod, total, deliveryMethod, cartId, orderId } = route.params;

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  // Reset payment state when component mounts
  useEffect(() => {
    dispatch(resetPaymentState());
  }, []);

  // Xử lý hoàn tất đơn hàng và xóa giỏ hàng
  const finalizeOrder = async () => {
    try {
      if (!orderId) return;

      // Cập nhật trạng thái đơn hàng thành completed
      await api.patch(`/orders/${orderId}`, {
        status: 'completed'
      });

      // Xóa giỏ hàng sau khi đơn hàng đã hoàn tất
      if (cartId) {
        await api.patch(`/cart/${cartId}`, { items: [] });
        dispatch(clearCart());
      }

      // Cập nhật lịch sử đơn hàng
      dispatch(fetchOrderHistory());

      setIsProcessing(false);
    } catch (error) {
      console.error('Error finalizing order:', error);
      setError('Có lỗi xảy ra khi hoàn tất đơn hàng');
    }
  };

  // Lấy thông tin chi tiết đơn hàng và hoàn tất quá trình thanh toán
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          setError('Không tìm thấy mã đơn hàng');
          return;
        }

        const response = await api.get(`/orders/${orderId}`);
        
        if (response.data) {
          setOrderDetails(response.data);
          
          // Chỉ hoàn tất đơn hàng nếu trạng thái là 'pending'
          if (response.data.status === 'pending') {
            await finalizeOrder();
          } else {
            setIsProcessing(false);
          }

          if (response.data.items && response.data.items.length > 0) {
            fetchProductsFromOrder(response.data.items);
          }
        } else {
          setError('Không thể tải thông tin đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Hiển thị thông báo khi đặt hàng thành công
  useEffect(() => {
    if (orderId && orderDetails && !isProcessing) {
      // Hiển thị toast notification
      if (Platform.OS === 'android') {
        ToastAndroid.show('Đặt hàng thành công!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Thông báo', 'Đặt hàng thành công!');
      }

      // Hiển thị push notification
      const totalItems = orderDetails.items.reduce((sum, item) => sum + item.quantity, 0);
      notificationService.showNotification(
        "Đặt hàng thành công! 🌿",
        `Đơn hàng #${orderId} với ${totalItems} sản phẩm đã được xác nhận`,
        { orderId, type: 'order_success' }
      );

      // Chỉ thêm vào danh sách thông báo nếu không phải từ màn hình AfterPayment
      if (!route.params?.fromAfterPayment) {
        dispatch(addToOrderHistory(orderDetails));
      }
    }
  }, [orderId, orderDetails, isProcessing]);

  // Hàm hiển thị tên phương thức vận chuyển
  const renderDeliveryMethod = () => {
    if (deliveryMethod === 1) {
      return 'Giao hàng Nhanh - 15.000đ\n(Dự kiến giao hàng 3 - 5 ngày)';
    } else {
      return 'Giao hàng COD - 20.000đ\n(Dự kiến giao hàng 1 - 3 ngày)';
    }
  };

  // Hàm hiển thị tên phương thức thanh toán
  const renderPayMethod = () => {
    if (payMethod === 1) return 'Thẻ VISA/MASTERCARD';
    if (payMethod === 2) return 'Thẻ ATM';
    return 'Khác';
  };

  // Lấy dữ liệu sản phẩm từ đơn hàng
  const fetchProductsFromOrder = async (orderItems: any[]) => {
    try {
      setLoadingProducts(true);
      
      const productList: ProductType[] = [];
      
      for (const item of orderItems) {
        try {
          const response = await api.get(`/products/${item.id}`);
          if (response.data) {
            productList.push({
              ...response.data,
              quantityInCart: item.quantity,
            });
          }
        } catch (err) {
          console.error(`Error fetching product ${item.id}:`, err);
        }
      }
      
     
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products from order:', error);
      setError('Không thể tải thông tin sản phẩm từ đơn hàng');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Lấy dữ liệu sản phẩm trong cart (phương pháp cũ)
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
   
      
      const cartResponse = await api.get(`/cart/${cartId}`);
      const { items }: { items: CartItem[] } = cartResponse.data;
      
 

      if (!items || items.length === 0) {
        console.log('No items in cart');
        setLoadingProducts(false);
        return;
      }

      const promises = items.map((item) => api.get(`/products/${item.id}`));
      const responses = await Promise.all(promises);

      const productList: ProductType[] = responses.map((res, index) => ({
        ...res.data,
        quantityInCart: items[index].quantity,
      }));

   
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products from cart:', error);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Chỉ gọi fetchProducts nếu không có orderId
  useEffect(() => {
    if (!orderId) {
      fetchProducts();
    }
  }, [orderId]);

  const goToGuide = () => {
    console.log('Navigating to Guide screen');
    navigation.navigate('HandbookList');
  };

  const goToHome = () => {
    console.log('Navigating to Home screen');
    navigation.navigate('Tab', { screen: 'Home' });
  };

  //Xóa dữ liệu cart
  const deleteItemCart = async () => {
    try {

      await api.patch(`/cart/${cartId}`, { items: [] });
    
    } catch (error) {
      console.error('Error deleting cart:', error);
      setError('Không thể xóa giỏ hàng');
    }
  };

  const renderItem = ({ item }: { item: ProductType }) => {
    return <PaymentItem item={item} onPress={() => {}} />;
  };

  // Dùng ListHeaderComponent để hiển thị phần thông tin khác
  const renderHeader = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.successText}>Bạn đã đặt hàng thành công</Text>
      
      {orderId && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Mã đơn hàng</Text>
          <Text style={[styles.infoText, { fontWeight: 'bold' }]}>{orderId}</Text>
        </View>
      )}

      {/* Thông tin khách hàng */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
        <Text style={styles.infoText}>{user.name}</Text>
        <Text style={styles.infoText}>{user.email}</Text>
        <Text style={styles.infoText}>{user.phone}</Text>
        <Text style={styles.infoText}>{user.address}</Text>
      </View>

      {/* Phương thức vận chuyển */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
        <Text style={styles.infoText}>{renderDeliveryMethod()}</Text>
      </View>

      {/* Hình thức thanh toán */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Hình thức thanh toán</Text>
        <Text style={styles.infoText}>{renderPayMethod()}</Text>
      </View>

      {/* Đơn hàng đã chọn */}
      <View style={{ marginBottom: 0 }}>
        <Text style={styles.sectionTitle}>Đơn hàng đã chọn</Text>
      </View>
      
      {/* Hiển thị lỗi nếu có */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // Dùng ListFooterComponent để hiển thị nút và thông tin thanh toán
  const renderFooter = () => (
    <View style={styles.buttonContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.infoFooter}>Đã thanh toán</Text>
        <Text style={styles.infoFooter}>{total.toLocaleString('vi-VN')}đ</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={goToGuide}>
        <Text style={styles.buttonText}>Xem Cẩm nang trồng cây</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonQuayVe, { marginTop: 10 }]}
        onPress={goToHome}
      >
        <Text style={styles.buttonTextQuayVe}>Quay về Trang chủ</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading || loadingProducts) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 20, color: 'gray' }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} title={'THÔNG BÁO'} />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
      {renderFooter()}
    </View>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  },
  infoFooter: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    marginTop: 5,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: 'black',
    borderBottomColor: 'gray',
    paddingBottom: 5,
    borderBottomWidth: 1,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 100,
    height: 200,
  },
  buttonQuayVe: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextQuayVe: {
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '400',
    color: 'black',
  },
});
