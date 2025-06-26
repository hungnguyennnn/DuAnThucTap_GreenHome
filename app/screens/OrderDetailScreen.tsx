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
} from 'react-native';
import AppHeader from '../components/AppHeader';
import api from '../configs/api';
import PaymentItem from '../components/PaymentItem';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { setLoading, setError, setOrders } from '../redux/slices/paymentSlice';

interface OrderDetailProps {
  navigation: any;
  route: {
    params: {
      orderId: string;
    };
  };
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
    quantity: number;
    price: string;
    name: string;
  }[];
  total: number;
  shippingFee: number;
  deliveryMethod: number;
  payMethod: number;
  address: string;
  phone: string;
  userId: string;
}

const OrderDetailScreen: React.FC<OrderDetailProps> = ({
  navigation,
  route,
}) => {
  const { orderId } = route.params;
  const [products, setProducts] = useState<ProductType[]>([]);
  const dispatch = useDispatch();
  
  // Lấy dữ liệu từ Redux store
  const { orders, loading, error } = useSelector((state: RootState) => state.payment);
  const { user } = useSelector((state: RootState) => state.auth);
  const orderDetails = orders.find(order => order.id === orderId);
  const [orderUser, setOrderUser] = useState<any>(null);

  // Kiểm tra nếu đơn hàng không thuộc về người dùng hiện tại
  useEffect(() => {
    if (orderDetails && user && orderDetails.userId !== user.id) {
      Alert.alert('Lỗi', 'Bạn không có quyền xem đơn hàng này');
      navigation.goBack();
    }
  }, [orderDetails, user, navigation]);

  // Lấy thông tin chi tiết đơn hàng
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          console.log('No orderId provided for fetching order details');
          return;
        }

        if (orderDetails?.userId) {
          const userResponse = await api.get(`/users/${orderDetails.userId}`);
          if (userResponse.data) {
            setOrderUser(userResponse.data);
          }
          
          // Fetch products from order items
          if (orderDetails.items && orderDetails.items.length > 0) {
            fetchProductsFromOrder(orderDetails.items);
          }
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        dispatch(setError('Có lỗi xảy ra khi tải thông tin đơn hàng'));
      }
    };

    if (orderDetails && user) {
      fetchOrderDetails();
    }
  }, [orderId, orderDetails, user]);

  // Hàm hiển thị tên phương thức vận chuyển
  const renderDeliveryMethod = () => {
    if (orderDetails?.deliveryMethod === 1) {
      return 'Giao hàng Nhanh - 15.000đ\n(Dự kiến giao hàng 3 - 5 ngày)';
    } else {
      return 'Giao hàng COD - 20.000đ\n(Dự kiến giao hàng 1 - 3 ngày)';
    }
  };

  // Hàm hiển thị tên phương thức thanh toán
  const renderPayMethod = () => {
    if (orderDetails?.payMethod === 1) return 'Thẻ VISA/MASTERCARD';
    if (orderDetails?.payMethod === 2) return 'Thẻ ATM';
    return 'Khác';
  };

  // Lấy dữ liệu sản phẩm từ đơn hàng
  const fetchProductsFromOrder = async (orderItems: any[]) => {
    try {
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
      
      // Cập nhật productImage trong Redux store
      if (productList.length > 0 && orderDetails) {
        // Lấy danh sách orders từ Redux
        const updatedOrders = [...orders];
        // Tìm index của đơn hàng hiện tại
        const orderIndex = updatedOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1 && productList[0].images && productList[0].images.length > 0) {
          // Cập nhật productImage cho đơn hàng
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            productImage: productList[0].images[0]
          };
          
          // Cập nhật lại danh sách orders trong Redux
          dispatch(setOrders(updatedOrders));
        }
      }
    } catch (error) {
      console.error('Error fetching products from order:', error);
      dispatch(setError('Không thể tải thông tin sản phẩm từ đơn hàng'));
    }
  };

  const renderItem = ({ item }: { item: ProductType }) => {
    return <PaymentItem item={item} onPress={() => {}} />;
  };

  // Dùng ListHeaderComponent để hiển thị phần thông tin khác
  const renderHeader = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.successText}>Bạn đã đặt hàng thành công</Text>
      <Text style={styles.dateText}>
        {orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : ''}
      </Text>
      
      {orderId && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Mã đơn hàng</Text>
          <Text style={[styles.infoText, { fontWeight: 'bold' }]}>{orderId}</Text>
        </View>
      )}

      {orderUser && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <Text style={styles.infoText}>{orderUser.name}</Text>
          <Text style={styles.infoText}>{orderUser.email}</Text>
          <Text style={styles.infoText}>{orderUser.phone}</Text>
          <Text style={styles.infoText}>{orderUser.address}</Text>
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
        <Text style={styles.infoText}>{renderDeliveryMethod()}</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Hình thức thanh toán</Text>
        <Text style={styles.infoText}>{renderPayMethod()}</Text>
      </View>

      <View style={{ marginBottom: 0 }}>
        <Text style={styles.sectionTitle}>Đơn hàng đã chọn</Text>
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // Dùng ListFooterComponent để hiển thị thông tin thanh toán
  const renderFooter = () => (
    <View style={styles.buttonContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.infoFooter}>Đã thanh toán</Text>
        <Text style={styles.infoFooter}>{orderDetails?.total.toLocaleString('vi-VN')}đ</Text>
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

  const goToGuide = () => {
    navigation.navigate('HandbookList');
  };

  const goToHome = () => {
    navigation.navigate('Tab', { screen: 'Home' });
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Bạn cần đăng nhập để xem chi tiết đơn hàng</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 20, color: 'gray' }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
        <TouchableOpacity
          style={[styles.buttonQuayVe, { marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonTextQuayVe}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} title={'CHI TIẾT ĐƠN HÀNG'} />

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

export default OrderDetailScreen;

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
    marginBottom: 10,
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  },
  dateText: {
    alignSelf: 'center',
    marginBottom: 30,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  infoFooter: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    marginTop: 5,
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
    paddingBottom: 20,
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
  loginButton: {
    marginTop: 20,
    backgroundColor: '#007537',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
