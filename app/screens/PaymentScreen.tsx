import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import InputUnderlined from '../components/InputUnderlined';
import AppHeader from '../components/AppHeader';
import api from '../configs/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, processPayment } from '../redux/actions/paymentActions';
import { RootState } from '../redux/store/store';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { setPaymentSuccess, setCurrentOrder } from '../redux/slices/paymentSlice';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const PaymentScreen: React.FC<any> = ({ navigation, route }) => {
  const dispatch = useDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { loading, error: paymentError, currentOrder, paymentSuccess } = useSelector((state: RootState) => state.payment);
  const { items } = useSelector((state: RootState) => state.cart);
  const { products } = useSelector((state: RootState) => state.cart);
  
  const total = route?.params?.total || 0;
  const cartId = route?.params?.cartId || '';
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<number>(1);
  const [payMethod, setPayMethod] = useState<number>(1);
  const [updatingUserInfo, setUpdatingUserInfo] = useState<boolean>(false);
  const [userInfoChanged, setUserInfoChanged] = useState<boolean>(false);

  // Fetch thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await api.get(`/users/${userId}`);
          setUser(response.data);
          setPhoneNumber(response.data.phone || '');
          setAddress(response.data.address || '');
        }
      } catch (error) {
        console.log('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Kiểm tra nếu thông tin đã thay đổi
  useEffect(() => {
    if (user.id) {
      const phoneChanged = phoneNumber !== user.phone;
      const addressChanged = address !== user.address;
      setUserInfoChanged(phoneChanged || addressChanged);
    }
  }, [phoneNumber, address, user]);

  // Xử lý khi thanh toán thành công
  useEffect(() => {
    
    if (paymentSuccess && currentOrder) {
      // Reset payment success state sau khi navigate để tránh loop
      dispatch(setPaymentSuccess(false)); // Reset trước khi navigate
      setTimeout(() => {
        navigation.navigate('AfterPayment', {
          total,
          user: {
            ...user,
            phone: phoneNumber,
            address: address
          },
          deliveryMethod,
          payMethod,
          cartId,
          orderId: currentOrder.id,
        });
      }, 300); // Tăng timeout để đảm bảo việc reset state đã hoàn tất
    }
  }, [paymentSuccess, currentOrder]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (paymentError) {
      setError(paymentError);
    }
  }, [paymentError]);

  // Cập nhật thông tin người dùng
  const updateUserInfo = async () => {
    if (!userInfoChanged) return true;
    
    try {
      setUpdatingUserInfo(true);
      
      if (!user.id) {
        setError('Không thể cập nhật thông tin người dùng khi chưa đăng nhập');
        return false;
      }
      
      const updatedUser = {
        ...user,
        phone: phoneNumber,
        address: address
      };
      
  
      const response = await api.patch(`/users/${user.id}`, {
        phone: phoneNumber,
        address: address
      });
      
      if (response.data) {
        setUser(updatedUser);
        ToastAndroid.show('Thông tin đã được cập nhật', ToastAndroid.SHORT);
        setUserInfoChanged(false);
        return true;
      } else {
        setError('Không thể cập nhật thông tin người dùng');
        return false;
      }
    } catch (err) {
      console.error('Error updating user information:', err);
      setError('Có lỗi xảy ra khi cập nhật thông tin');
      return false;
    } finally {
      setUpdatingUserInfo(false);
    }
  };

  const handlePayment = async () => {
    try {
      setError(''); // Xóa lỗi cũ nếu có
      
      // Kiểm tra địa chỉ
      if (!address || address.trim() === '') {
        setError('Vui lòng nhập địa chỉ giao hàng!');
        return;
      }
      
      // Kiểm tra số điện thoại
      if (!phoneNumber || phoneNumber.trim() === '') {
        setError('Vui lòng nhập số điện thoại!');
        return;
      }

      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user.id) {
        setError('Bạn cần đăng nhập để thực hiện thanh toán!');
        return;
      }

      // Kiểm tra giỏ hàng
      if (!items || items.length === 0) {
        setError('Giỏ hàng của bạn đang trống!');
        return;
      }
      

      // Kiểm tra danh sách sản phẩm
      if (!products || products.length === 0) {
        setError('Không tìm thấy thông tin sản phẩm!');
        return;
      }

      // Cập nhật thông tin người dùng nếu có thay đổi
      if (userInfoChanged) {
        const updateSuccess = await updateUserInfo();
        if (!updateSuccess) {
          // Hiển thị xác nhận nếu không thể cập nhật
          Alert.alert(
            'Thông tin chưa được lưu',
            'Không thể cập nhật thông tin người dùng. Bạn vẫn muốn tiếp tục thanh toán?',
            [
              { 
                text: 'Huỷ', 
                style: 'cancel' 
              },
              { 
                text: 'Tiếp tục', 
                onPress: () => continuePayment() 
              }
            ],
            { cancelable: false }
          );
          return;
        }
      }
      
      // Nếu thông tin không thay đổi hoặc đã cập nhật thành công, tiếp tục thanh toán
      continuePayment();
    } catch (err) {
      console.error('Error in handlePayment:', err);
      setError('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng kiểm tra kết nối và thử lại.');
    }
  };

  const continuePayment = async () => {
    try {
      // Lấy dữ liệu sản phẩm từ state Redux
      // Chuẩn bị dữ liệu đơn hàng
      const formattedItems = items.map(item => {
        // Tìm thông tin sản phẩm tương ứng từ danh sách products
        const productInfo = products.find(p => p.id === item.id);
        
        if (!productInfo) {
          console.log('Product not found for item ID:', item.id);
          return {
            id: item.id,
            quantity: item.quantity,
            price: "0",
            name: "Sản phẩm không xác định"
          };
        }
        
        return {
          id: item.id,
          quantity: item.quantity,
          price: productInfo.price || "0",
          name: productInfo.name || "Sản phẩm"
        };
      });

      const shippingFee = deliveryMethod === 1 ? 15000 : 20000;
      const orderData = {
        userId: user.id,
        items: formattedItems,
        total: total + shippingFee,
        shippingFee,
        deliveryMethod,
        payMethod,
        address,
        phone: phoneNumber,
      };
      

      // Đặt trực tiếp sang màn hình AfterPayment nếu cần debug
      const debugMode = false; // Đặt thành true để debug
      if (debugMode) {
        const tempOrderId = `OR${Date.now()}`;
        // Set payment success và current order để useEffect chuyển hướng
        dispatch(setCurrentOrder({
          ...orderData,
          id: tempOrderId,
          status: 'pending',
          createdAt: new Date().toISOString()
        } as any));
        dispatch(setPaymentSuccess(true));
        return;
      }
      
      // Gọi action để tạo đơn hàng
      const result = await dispatch(createOrder(orderData));
      
      // Kiểm tra kết quả tạo đơn hàng
      if (!result.payload) {
        setError('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
      } else {
        // Nếu cần thiết, có thể set lại payment success ở đây
        dispatch(setPaymentSuccess(true));
      }
    } catch (err) {
      console.error('Error in continuePayment:', err);
      setError('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <AppHeader navigation={navigation} title={'THANH TOÁN'} />
        <View style={{ marginTop: 10 }}>
          <Text
            style={[
              styles.textUnderlined,
              { color: 'black', fontWeight: 'bold', marginBottom: 5 },
            ]}
          >
            Thông tin khách hàng
          </Text>
          <InputUnderlined editable={false} value={user.name} />
          <InputUnderlined editable={false} value={user.email} />
          <InputUnderlined
            placeholder={'Nhập số điện thoại'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <InputUnderlined
            placeholder={'Nhập địa chỉ'}
            value={address}
            onChangeText={setAddress}
          />
          {userInfoChanged && (
            <Text style={styles.infoText}>
              (Thông tin địa chỉ và số điện thoại sẽ được cập nhật vào tài khoản của bạn)
            </Text>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={{ marginTop: 30 }}>
          <Text
            style={[
              styles.textUnderlined,
              { color: 'black', fontWeight: 'bold' },
            ]}
          >
            Phương thức vận chuyển
          </Text>
          <TouchableOpacity
            onPress={() => setDeliveryMethod(1)}
            style={{ marginBottom: 10 }}
          >
            <Text
              style={[
                styles.giaoHang,
                deliveryMethod === 1 ? { color: 'green' } : { color: 'black' },
              ]}
            >
              Giao hàng Nhanh - 15.000đ
            </Text>
            <Text style={styles.textUnderlined}>
              Dự kiến giao hàng 3 - 5 ngày
            </Text>
            {deliveryMethod === 1 && (
              <Image
                style={styles.checkIcon}
                source={require('../../assets/images/check.png')}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeliveryMethod(2)}
            style={{ marginBottom: 10 }}
          >
            <Text
              style={[
                styles.giaoHang,
                deliveryMethod === 2 ? { color: 'green' } : { color: 'black' },
              ]}
            >
              Giao hàng COD - 20.000đ
            </Text>
            <Text style={styles.textUnderlined}>
              Dự kiến giao hàng 1 - 3 ngày
            </Text>
            {deliveryMethod === 2 && (
              <Image
                style={styles.checkIcon}
                source={require('../../assets/images/check.png')}
              />
            )}
          </TouchableOpacity>

          <View style={{ marginTop: 20 }}>
            <Text
              style={[
                styles.textUnderlined,
                { color: 'black', fontWeight: 'bold' },
              ]}
            >
              Hình thức thanh toán
            </Text>
            <TouchableOpacity
              onPress={() => setPayMethod(1)}
              style={{ marginBottom: 10 }}
            >
              <Text
                style={[
                  styles.textUnderlined,
                  payMethod === 1 ? { color: 'green' } : { color: 'black' },
                ]}
              >
                Thẻ VISA/MASTERCARD
              </Text>
              {payMethod === 1 && (
                <Image
                  style={styles.checkIconPaymethod}
                  source={require('../../assets/images/check.png')}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPayMethod(2)}>
              <Text
                style={[
                  styles.textUnderlined,
                  payMethod === 2 ? { color: 'green' } : { color: 'black' },
                ]}
              >
                Thẻ ATM
              </Text>
              {payMethod === 2 && (
                <Image
                  style={styles.checkIconPaymethod}
                  source={require('../../assets/images/check.png')}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <View style={styles.boxBottom}>
              <Text style={styles.subtitle}>Tạm tính</Text>
              <Text style={[styles.subtitle, { color: 'black' }]}>
                {total.toLocaleString('de-DE')}đ
              </Text>
            </View>
            <View style={styles.boxBottom}>
              <Text style={styles.subtitle}>Phí vận chuyển</Text>
              <Text style={[styles.subtitle, { color: 'black' }]}>
                {deliveryMethod === 1 ? '15.000' : '20.000'}đ
              </Text>
            </View>
            <View style={styles.boxBottom}>
              <Text style={styles.subtitle}>Tổng cộng</Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: 'green', fontWeight: 'bold' },
                ]}
              >
                {(
                  total + (deliveryMethod === 1 ? 15000 : 20000)
                ).toLocaleString('de-DE')}{' '}
                đ
              </Text>
            </View>
          </View>

          {/* Nút Cập nhật thông tin */}
          {userInfoChanged && (
            <TouchableOpacity
              style={[
                styles.updateButton,
                updatingUserInfo ? styles.disabledButton : styles.activeUpdateButton,
              ]}
              onPress={updateUserInfo}
              disabled={updatingUserInfo || !userInfoChanged}
            >
              {updatingUserInfo ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>CẬP NHẬT THÔNG TIN</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Nút Thanh Toán */}
          <TouchableOpacity
            style={[
              styles.button,
              !address || !phoneNumber || loading || updatingUserInfo
                ? styles.disabledButton 
                : styles.activeButton,
            ]}
            onPress={handlePayment}
            disabled={!address || !phoneNumber || loading || updatingUserInfo}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>TIẾP TỤC</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  error: {
    fontWeight: '600',
    fontSize: 16,
    color: 'red',
  },
  infoText: {
    fontSize: 14,
    color: 'green',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  button: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  updateButton: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  activeUpdateButton: {
    backgroundColor: '#2196F3',
  },
  activeButton: {
    backgroundColor: 'green',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  subtitle: {
    fontSize: 14,
  },
  boxBottom: {
    marginHorizontal: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textUnderlined: {
    fontSize: 16,
    color: 'gray',
    borderBottomColor: 'gray',
    paddingBottom: 5,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  checkIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  checkIconPaymethod: {
    position: 'absolute',
    right: 10,
  },
  giaoHang: {
    fontSize: 16,
    fontWeight: '400',
  },
  backIcon: {
    marginLeft: -20,
  },
  title: {
    alignSelf: 'center',
    color: 'black',
    fontWeight: '500',
    fontSize: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  paymentButton: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'green',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
