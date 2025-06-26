import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ToastAndroid,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store/store';
import { fetchCart, fetchCartProducts, updateCartItems, clearCartItems } from '../redux/actions/cartActions';
import { CartItem } from '../redux/slices/cartSlice';
import { Product } from '../redux/slices/productSlice';

const CartScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, cartId, products, loading, error } = useSelector((state: RootState) => state.cart);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    // Lấy giỏ hàng và sản phẩm khi component mount
    dispatch(fetchCart());
    dispatch(fetchCartProducts());
  }, [dispatch]);

  // Toggle chọn/bỏ chọn sản phẩm
  const toggleSelectItem = (id: string) => {
    const updatedCart = items.map((item) =>
      item.id === id ? { ...item, select: !item.select } : item
    );
    dispatch(updateCartItems({ cartId, items: updatedCart }));
  };

  // Tăng/giảm số lượng
  const handleQuantityChange = (id: string, change: number) => {
    const updatedCart = items.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    );
    dispatch(updateCartItems({ cartId, items: updatedCart }));
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (id: string) => {
    const updatedCart = items.filter((item) => item.id !== id);
    dispatch(updateCartItems({ cartId, items: updatedCart }));
  };

  // Xóa toàn bộ đơn hàng
  const handleRemoveAll = async () => {
    setModalVisible(false);
    const result = await dispatch(clearCartItems(cartId));
    if (result.payload) {
      ToastAndroid.show('Đã xóa toàn bộ đơn hàng!', ToastAndroid.SHORT);
    }
  };

  // Tính tổng (chỉ tính những sản phẩm được chọn)
  const total = items.reduce((sum, item) => {
    if (!item.select) return sum;
    const product = products.find((p) => p.id === item.id);
    if (!product) return sum;
    const price = parseFloat(String(product.price).replace(/\./g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  const renderItemCart = ({ item }: { item: CartItem }) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return null;

    return (
      <View style={styles.cartItemContainer}>
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleSelectItem(item.id)}
        >
          <Image
            source={
              item.select
                ? require('../../assets/images/checkCart.png')
                : require('../../assets/images/uncheck.png')
            }
            style={styles.checkbox}
          />
        </TouchableOpacity>

        {/* Hình ảnh sản phẩm */}
        <Image style={styles.imageStyle} source={{ uri: product.images[0] }} />

        <View style={styles.infoContainer}>
          {/* Tên sản phẩm + character */}
          <Text style={styles.productName} numberOfLines={1}>
            {product.name} | {product.character || 'Ưa bóng'}
          </Text>
          {/* Giá */}
          <Text style={styles.productPrice}>
            {product.price.toLocaleString()}đ
          </Text>
          {/* Tăng/giảm số lượng + nút Xóa */}
          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)}>
              <Image
                style={styles.icon}
                source={require('../../assets/images/minusSquare.png')}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)}>
              <Image
                style={styles.icon}
                source={require('../../assets/images/plusSquare.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
              <Text style={styles.deleteText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const goToPayment = () => {
    if (!total) {
      ToastAndroid.show('Vui lòng chọn sản phẩm!', ToastAndroid.SHORT);
      return;
    }
    navigation.navigate('Payment', { total, cartId });
  };

  // Hiển thị màn hình loading
  if (loading && items.length === 0 && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007537" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  // Hiển thị nếu có lỗi
  if (error && items.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            dispatch(fetchCart());
            dispatch(fetchCartProducts());
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.backIcon}
            source={require('../../assets/images/backIcon.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GIỎ HÀNG</Text>
        {items.length === 0 ? (
          <View />
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              style={styles.deleteIcon}
              source={require('../../assets/images/deleteIcon.png')}
            />
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <Text style={styles.nullText}>Giỏ hàng của bạn hiện đang trống</Text>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Danh sách giỏ hàng */}
          <FlatList
            data={items}
            renderItem={renderItemCart}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartListContainer}
          />

          {/* Footer: Tạm tính + nút thanh toán */}
          <View style={styles.footerContainer}>
            <View style={styles.tempPriceContainer}>
              <Text style={styles.tempPriceLabel}>Tạm tính</Text>
              <Text style={styles.tempPriceValue}>
                {total.toLocaleString('de-DE')}đ
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.btnPay,
                total === 0 ? styles.btnPayDisabled : null
              ]} 
              onPress={goToPayment}
              disabled={total === 0}
            >
              <Text style={styles.btnPayText}>Tiến hành thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal xác nhận xóa toàn bộ */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xóa tất cả đơn hàng?</Text>
            <Text style={styles.modalSubtitle}>
              Thao tác này sẽ không thể khôi phục
            </Text>
            <Pressable 
              style={styles.modalButton}
              onPress={handleRemoveAll}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>
                {loading ? 'Đang xử lý...' : 'Đồng ý'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Hủy bỏ</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    marginTop: 44,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  nullText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  cartListContainer: {
    paddingVertical: 10,
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
  imageStyle: {
    width: 65,
    height: 70,
    borderRadius: 8,
    marginHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    marginLeft: 10,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#007537',
    marginBottom: 5,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    color: '#000',
    width: 30,
    textAlign: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 20,
    textDecorationLine: 'underline',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  tempPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempPriceLabel: {
    fontSize: 16,
    color: '#000',
  },
  tempPriceValue: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
  btnPay: {
    backgroundColor: '#007537',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnPayDisabled: {
    backgroundColor: '#ccc',
  },
  btnPayText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007537',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#007537',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
