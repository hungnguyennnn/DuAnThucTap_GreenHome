import React, { useEffect, useState, memo } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
  ToastAndroid,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import AppHeader from '../components/AppHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store/store';
import { fetchProductDetail } from '../redux/actions/productActions';
import { Product } from '../redux/slices/productSlice';
import api from '../configs/api';

const Details = (props: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct, loading, error } = useSelector((state: RootState) => state.products);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const { navigation } = props;

  // Lấy id từ params (HomeScreen truyền sang)
  const id = props?.route?.params?.id;

  const addQuantity = () => {
    setQuantity(quantity + 1);
  };

  const subQuantity = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  // Lấy thông tin chi tiết sản phẩm qua ID
  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetail(id));
    }
  }, [id, dispatch]);

  // Thêm sản phẩm vào giỏ hàng
  const add = async () => {
    if (!selectedProduct) return;
    if (quantity < 1) {
      ToastAndroid.show('Vui lòng chọn số lượng!', ToastAndroid.SHORT);
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Lỗi', 'User chưa đăng nhập');
        return;
      }
      
      // Lấy giỏ hàng của user
      const cartResponse = await api.get(`/cart?userId=${userId}`);
      let cart = cartResponse.data && cartResponse.data.length > 0
        ? cartResponse.data[0]
        : null;
      
      // Nếu chưa có giỏ hàng, tạo mới giỏ hàng
      if (!cart) {
        const rand = Math.floor(Math.random() * 1000);
        cart = { id: 'CA' + rand, userId, items: [] };
        await api.post('/cart', cart);
      }
      
      // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
      const existingIndex = cart.items.findIndex(
        (item: any) => item.id === selectedProduct.id
      );
      
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({ id: selectedProduct.id, quantity, select: true });
      }

      await api.patch(`/cart/${cart.id}`, { items: cart.items });
      
      ToastAndroid.show('Đã thêm vào giỏ hàng!', ToastAndroid.SHORT);
      navigation.navigate('Cart');
    } catch (error: any) {
      console.log('Lỗi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const renderImages = () => {
    if (!selectedProduct || !selectedProduct.images || selectedProduct.images.length === 0) {
      return null;
    }
    return (
      <View key={selectedIndex}>
        <Image
          source={{ uri: selectedProduct.images[selectedIndex] }}
          style={styles.imageProduct}
        />
      </View>
    );
  };

  // Hiển thị chấm (dots) tương ứng với số lượng ảnh
  const renderDots = () => {
    if (!selectedProduct || !selectedProduct.images || selectedProduct.images.length === 0) {
      return null;
    }
    return selectedProduct.images.map((_, index) => (
      <View
        key={index}
        style={{
          marginTop: -25,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: selectedIndex === index ? 'black' : 'gray',
          margin: 5,
        }}
      />
    ));
  };

  // Hiển thị trạng thái đang tải
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007537" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Hiển thị khi có lỗi
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => dispatch(fetchProductDetail(id))}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Hiển thị khi không có sản phẩm
  if (!selectedProduct) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const parsePrice = parseFloat(selectedProduct.price.replace('.', '')) || 0;
  const totalTemp = quantity * parsePrice;

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader navigation={navigation} title={selectedProduct.name} />

      {/* Slider ảnh */}
      <View style={styles.slider}>
        <PagerView style={styles.pagerView} initialPage={selectedIndex}>
          {renderImages()}
        </PagerView>

        <View style={styles.dotsContainer}>{renderDots()}</View>

        <TouchableOpacity
          style={styles.previousIcon}
          onPress={() => {
            selectedIndex === 0
              ? setSelectedIndex(0)
              : setSelectedIndex(selectedIndex - 1);
          }}
        >
          <Image source={require('../../assets/images/previousIcon.png')} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextIcon}
          onPress={() => {
            if (selectedProduct.images && selectedIndex < selectedProduct.images.length - 1) {
              setSelectedIndex(selectedIndex + 1);
            }
          }}
        >
          <Image
            style={styles.nextIcon}
            source={require('../../assets/images/nextIcon.png')}
          />
        </TouchableOpacity>
      </View>

      {/* Thông tin tóm tắt (type, character) */}
      <View style={styles.greenContaienr}>
        {selectedProduct.type ? (
          <Text style={styles.greenBox}>
            {selectedProduct.type == 'plant'
              ? 'Cây trồng'
              : selectedProduct.type == 'plantpot'
              ? 'Chậu cảnh'
              : 'Phụ kiện'}
          </Text>
        ) : null}
        {selectedProduct.character ? (
          <Text style={styles.greenBox}>{selectedProduct.character}</Text>
        ) : null}
      </View>

      {/* Giá */}
      <Text style={styles.price}>{selectedProduct.price} đ</Text>

      {/* Chi tiết sản phẩm */}
      <View style={styles.field}>
        <Text style={styles.subtitle}>Chi tiết sản phẩm</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.infoText}>Kích cỡ</Text>
        <Text style={styles.infoText}>{selectedProduct.size}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.infoText}>Xuất xứ</Text>
        <Text style={styles.infoText}>{selectedProduct.origin}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.infoText}>Tình trạng</Text>
        <Text style={[styles.infoText, { color: 'green' }]}>
          Còn {selectedProduct.quantity} sp
        </Text>
      </View>

      {/* Chọn số lượng + Tạm tính */}
      <View style={styles.quantityPriceTitle}>
        <Text style={styles.fontSize18}>Đã chọn {quantity} sản phẩm</Text>
        <Text style={styles.fontSize18}>Tạm tính</Text>
      </View>
      <View style={styles.quantityPrice}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.buttonIcon} onPress={subQuantity}>
            <Image source={require('../../assets/images/minusSquare.png')} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={addQuantity}>
            <Image source={require('../../assets/images/plusSquare.png')} />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.total}>
            {totalTemp.toLocaleString('de-DE')} đ
          </Text>
        </View>
      </View>

      {/* Nút chọn mua */}
      <TouchableOpacity
        style={[
          styles.buttonChonMua,
          quantity >= 1 ? { backgroundColor: 'green' } : null,
        ]}
        onPress={add}
      >
        <Text style={styles.buttonText}>CHỌN MUA</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  pagerView: {
    width: '100%',
    height: 250,
    backgroundColor: '#F6F6F6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonChonMua: {
    marginTop: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: 'gray',
  },
  quantity: {
    fontSize: 23,
    color: 'black',
    marginRight: 40,
  },
  buttonIcon: {
    marginLeft: 10,
    marginRight: 40,
  },
  total: {
    fontSize: 24,
    color: 'black',
    marginRight: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
  },
  quantityPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fontSize18: {
    fontSize: 14,
  },
  quantityPriceTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 25,
  },
  infoText: {
    fontSize: 16,
  },
  field: {
    paddingTop: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
  },
  price: {
    color: 'green',
    fontSize: 25,
    marginLeft: 20,
    marginTop: 20,
  },
  greenContaienr: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20,
  },
  greenBox: {
    marginTop: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: 'green',
    color: 'white',
    borderRadius: 5,
  },
  nextIcon: {
    position: 'absolute',
    top: 55,
    right: 15,
    width: 24,
    height: 24,
  },
  previousIcon: {
    position: 'absolute',
    left: 15,
    top: 110,
  },
  imageProduct: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
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
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: 'white',
  },
  slider: {
    position: 'relative',
    marginBottom: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
