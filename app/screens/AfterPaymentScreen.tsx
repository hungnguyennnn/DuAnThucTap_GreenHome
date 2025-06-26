import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import InputUnderlined from '../components/InputUnderlined';
import api from '../configs/api';
import { useDispatch, useSelector } from 'react-redux';
import { processPayment } from '../redux/actions/paymentActions';
import { RootState } from '../redux/store/store';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { resetPaymentState, setPaymentSuccess } from '../redux/slices/paymentSlice';


const AfterPayment = ({ navigation, route }: any) => {
  const dispatch = useDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { loading, error: paymentError, paymentSuccess, currentOrder } = useSelector((state: RootState) => state.payment);
  
  const [modalVisible, setModalVisible] = useState(false);
  // Nhận các tham số được truyền từ màn hình Payment
  const { total, user, deliveryMethod, payMethod, cartId, orderId } = route.params;

  // State cho thẻ VISA/MASTER
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiry, setExpiry] = useState<string>(''); // MM/YY
  const [cvv, setCvv] = useState<string>('');

  // State cho thẻ ATM
  const [atmNumber, setAtmNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [localPaymentSuccess, setLocalPaymentSuccess] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Reset payment state when component mounts
  useEffect(() => {
    dispatch(resetPaymentState());
  }, []);

  // Tính phí vận chuyển
  const shippingFee = deliveryMethod === 1 ? 15000 : 20000;

  // Fetch thông tin đơn hàng
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

  // Xử lý khi thanh toán thành công
  useEffect(() => {
    if ((paymentSuccess || localPaymentSuccess) && !isNavigating) {
      setIsNavigating(true);
      // Chuyển sang màn hình PaymentSuccess và không cho phép quay lại
      navigation.replace('PaymentSuccess', {
        user,
        payMethod,
        total,
        deliveryMethod,
        cartId,
        orderId,
        fromAfterPayment: true // Thêm flag để đánh dấu nguồn màn hình
      });
    }
  }, [paymentSuccess, localPaymentSuccess, isNavigating]);

  // Theo dõi lỗi thanh toán
  useEffect(() => {
    if (paymentError) {
      setError(paymentError);
      setModalVisible(false);
    }
  }, [paymentError]);

  // Hàm kiểm tra logic thẻ VISA/MASTERCARD
  const validateCardVisaMaster = () => {
    const cardRegex = /^[0-9]{16}$/;
    if (!cardRegex.test(cardNumber)) {
      setError('Số thẻ VISA/MASTER phải gồm 16 chữ số');
      return false;
    }

    if (!cardName.trim()) {
      setError('Vui lòng nhập Tên chủ thẻ');
      return false;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) {
      setError('Ngày hết hạn không hợp lệ. Định dạng MM/YY');
      return false;
    }

    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(cvv)) {
      setError('CVV không hợp lệ (3 hoặc 4 chữ số)');
      return false;
    }

    return true;
  };

  const validateCardATM = () => {
    const atmRegex = /^[0-9]{5,19}$/;
    if (!atmRegex.test(atmNumber)) {
      setError('Số thẻ ATM phải từ 5 đến 19 chữ số');
      return false;
    }

    if (!bankName.trim()) {
      setError('Vui lòng nhập tên Ngân hàng');
      return false;
    }
    return true;
  };

  // Hàm xử lý khi nhấn nút Xác nhận
  const handleConfirm = () => {
    setError('');

    if (payMethod === 1) {
      if (!validateCardVisaMaster()) {
        return;
      }
    }

    if (payMethod === 2) {
      if (!validateCardATM()) {
        return;
      }
    }

    setModalVisible(true);
  };

  const renderDeliveryMethod = () => {
    if (deliveryMethod === 1) {
      return 'Giao hàng Nhanh - 15.000đ (Dự kiến 3 - 5 ngày)';
    } else {
      return 'Giao hàng COD - 20.000đ (Dự kiến 1 - 2 ngày)';
    }
  };

  // Hàm xử lý khi nhấn nút Đồng ý trong Modal
  const handlePayment = async () => {
    try {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setModalVisible(false);
        return;
      }

      if (!cartId) {
        setError('Không tìm thấy thông tin giỏ hàng');
        setModalVisible(false);
        return;
      }

      // Gọi action xử lý thanh toán với Redux
      const result = await dispatch(processPayment({ orderId, cartId }));
      
      if (!result.payload) {
        setError('Xử lý thanh toán thất bại. Vui lòng thử lại sau!');
        setModalVisible(false);
      } else {
        setLocalPaymentSuccess(true);
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Lỗi xử lý thanh toán:', err);
      setError('Có lỗi xảy ra khi xử lý thanh toán');
      setModalVisible(false);
      
      Alert.alert(
        'Lỗi thanh toán',
        'Không thể hoàn tất thanh toán. Vui lòng kiểm tra kết nối và thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} title={'THANH TOÁN'} />
      <ScrollView>
        <View style={{ marginTop: 10 }} />
        {payMethod === 1 && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>
              Nhập thông tin thẻ VISA/MASTER
            </Text>
            <InputUnderlined
              placeholder="Nhập số thẻ (16 chữ số)"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <InputUnderlined
              placeholder="Tên chủ thẻ"
              value={cardName}
              onChangeText={setCardName}
            />
            <InputUnderlined
              placeholder="Ngày hết hạn (MM/YY)"
              value={expiry}
              onChangeText={setExpiry}
              keyboardType="numeric"
            />
            <View>
              <InputUnderlined
                placeholder="CVV"
                keyboardType="numeric"
                value={cvv}
                onChangeText={setCvv}
                width={200}
              />
              <Image
                style={styles.infoIcon}
                source={require('../../assets/images/infoIcon.png')}
              />
            </View>
          </View>
        )}

        {/* Nếu payMethod = 2 -> Form ATM */}
        {payMethod === 2 && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Nhập thông tin thẻ ATM</Text>
            <InputUnderlined
              placeholder="Nhập số thẻ ATM"
              keyboardType="numeric"
              value={atmNumber}
              onChangeText={setAtmNumber}
            />
            <InputUnderlined
              placeholder="Tên Ngân hàng"
              value={bankName}
              onChangeText={setBankName}
            />
          </View>
        )}
        
        {/* Hiển thị lỗi nếu có */}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        {/* Thông tin đơn hàng */}
        {orderDetails && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            <Text style={styles.orderInfo}>Mã đơn hàng: {orderDetails.id}</Text>
            <Text style={styles.orderInfo}>Trạng thái: {orderDetails.status === 'pending' ? 'Chờ thanh toán' : orderDetails.status}</Text>
            <Text style={styles.orderInfo}>Ngày tạo: {new Date(orderDetails.createdAt).toLocaleString('vi-VN')}</Text>
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

        {/* Tạm tính + Phí vận chuyển + Tổng cộng */}
        <View style={{ marginBottom: 20 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Tạm tính</Text>
            <Text style={styles.value}>{total.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Phí vận chuyển</Text>
            <Text style={styles.value}>
              {shippingFee.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Tổng cộng</Text>
            <Text
              style={[styles.value, { color: 'green', fontWeight: 'bold' }]}
            >
              {(total + shippingFee).toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Nút xác nhận */}
        <TouchableOpacity 
          style={[
            styles.btnConfirm,
            loading && { backgroundColor: 'gray' }
          ]} 
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.btnConfirmText}>
            {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
          </Text>
        </TouchableOpacity>

        {/* Modal xác nhận thanh toán */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Xác nhận thanh toán?</Text>
              <Text style={styles.modalSubtitle}>
                Bạn sẽ thanh toán số tiền {(total + shippingFee).toLocaleString('vi-VN')}đ cho đơn hàng.
              </Text>
              <Pressable 
                style={[
                  styles.modalButton,
                  loading && { backgroundColor: 'gray' }
                ]} 
                onPress={handlePayment}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'ĐANG XỬ LÝ...' : 'ĐỒNG Ý'}
                </Text>
              </Pressable>
              <Pressable onPress={() => setModalVisible(false)} disabled={loading}>
                <Text style={styles.modalCancelText}>Hủy bỏ</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default AfterPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  cardSection: {
    marginBottom: 20,
  },
  orderSection: {
    marginBottom: 20,
  },
  orderInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
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
  infoText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    fontSize: 16,
  },
  btnConfirm: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoIcon: {
    position: 'absolute',
    right: 180,
    top: 12,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    marginTop: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#007537',
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
});
