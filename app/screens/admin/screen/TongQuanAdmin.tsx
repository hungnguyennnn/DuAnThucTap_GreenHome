import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Modal, Alert, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/TongQuanAdmin.styles';

// Tách riêng các phần UI
import SanPhamTab from './SanPhamTab';
import DonHangTab from './DonHangTab';
import ThongKeTab from './ThongKeTab';

// Services
import {
  Product,
  FormData,
  fetchProducts,
  deleteProduct,
  saveProduct,
  filterProducts,
  validateProductForm
} from '../services/sanpham';
import {
  Order,
  fetchOrders,
  updateOrderStatus,
  translateOrderStatus
} from '../services/donhang';
import { fetchStats } from '../services/thongke';
import ProductModal from './ProductModal';

export default function TongQuanAdmin() {
  const [activeSection, setActiveSection] = useState('products');
  const [productType, setProductType] = useState<'plant' | 'plantpot' | 'accessory'>('plant');
  const [plants, setPlants] = useState<Product[]>([]);
  const [plantpots, setPlantpots] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<string>('0đ');

  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    price: '',
    image: '',
    quantity: '0',
    lightPreference: 'Ưa sáng',
    type: 'plant'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const productData = await fetchProducts();

      // Sửa lại logic phân loại sản phẩm
      const plantsData = productData.filter(p => p.type === 'plant');
      const plantpotsData = productData.filter(p => p.type === 'plantpot' || p.type === 'pot');
      const accessoriesData = productData.filter(p => p.type === 'accessory');

      console.log('📊 Phân loại sản phẩm:');
      console.log('🌱 Plants:', plantsData.length);
      console.log('🪴 Plantpots:', plantpotsData.length);
      console.log('🔧 Accessories:', accessoriesData.length);

      setPlants(plantsData);
      setPlantpots(plantpotsData);
      setAccessories(accessoriesData);

      const orderData = await fetchOrders();
      setOrders(orderData);

      const revenue = calculateTotalRevenue(orderData);
      setTotalRevenue(revenue);

      const statsData = await fetchStats(productData.length);
      setUserCount(statsData.userCount);

    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = (orderList: Order[]): string => {
    let total = 0;
    orderList.forEach(order => {
      const price = order.totalPrice ? parseInt(order.totalPrice.replace(/[^\d]/g, ''), 10) : 0;
      if (!isNaN(price)) total += price;
    });
    return total.toLocaleString('vi-VN') + 'đ';
  };

  const getCurrentProducts = () => {
    let list: Product[] = [];
    switch (productType) {
      case 'plant':
        list = plants;
        break;
      case 'plantpot':
        list = plantpots;
        break;
      case 'accessory':
        list = accessories;
        break;
      default:
        list = [...plants, ...plantpots, ...accessories];
    }
    return filterProducts(list, searchQuery);
  };

  const handleAddProduct = () => {
    setIsEditMode(false);
    setCurrentProduct(null);
    setFormData({
      id: '',
      name: '',
      price: '',
      image: '',
      quantity: '0',
      lightPreference: 'Ưa sáng',
      type: productType === 'plant' ? 'plants' : productType === 'plantpot' ? 'pots' : 'accessories'
    });
    setModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      quantity: product.quantity.toString(),
      lightPreference: product.lightPreference || 'Ưa sáng',
      type: product.type === 'plant' ? 'plants' : product.type === 'plantpot' || product.type === 'pot' ? 'pots' : 'accessories'
    });
    setModalVisible(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteProduct(product.id);
          if (success) {
            loadAllData();
            Alert.alert('Thành công', 'Đã xóa sản phẩm thành công!');
          } else {
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm. Vui lòng thử lại sau.');
          }
        }
      }
    ]);
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm(formData)) return;
    const success = await saveProduct(formData, isEditMode, currentProduct?.id);
    if (success) {
      loadAllData();
      setModalVisible(false);
      Alert.alert('Thành công', isEditMode ? 'Sản phẩm đã được cập nhật!' : 'Sản phẩm mới đã được thêm!');
    } else {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm. Vui lòng thử lại sau.');
    }
  };

  const handleUpdateOrderStatus = async (order: Order) => {
    if (order.status !== 'pending') {
      Alert.alert('Không thể thay đổi', 'Chỉ có thể chuyển trạng thái từ "Đang xử lý" sang "Hoàn thành".');
      return;
    }
    const newStatus = 'completed';
    Alert.alert('Xác nhận thay đổi', `Chuyển trạng thái đơn hàng sang "${translateOrderStatus(newStatus)}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận', onPress: async () => {
          setLoading(true);
          const success = await updateOrderStatus(order.id, newStatus);
          if (success) {
            const updatedOrders = await fetchOrders();
            setOrders(updatedOrders);
            Alert.alert('Thành công', `Đã cập nhật trạng thái thành "${translateOrderStatus(newStatus)}"`);
          } else {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
          }
          setLoading(false);
        }
      }
    ]);
  };

  // Sửa lại hàm renderProductItem để render đúng item sản phẩm
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Image
        source={{ uri: item.images?.[0] || item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}đ</Text>
        <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
        {item.lightPreference && (
          <Text style={styles.productLight}>Ánh sáng: {item.lightPreference}</Text>
        )}
        {item.size && (
          <Text style={styles.productSize}>Kích thước: {item.size}</Text>
        )}
        {item.origin && (
          <Text style={styles.productOrigin}>Xuất xứ: {item.origin}</Text>
        )}
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditProduct(item)}
        >
          <Feather name="edit-2" size={16} color="#007537" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item)}
        >
          <Feather name="trash-2" size={16} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTopTabContent = () => {
    switch (activeSection) {
      case 'products':
        return (
          <SanPhamTab
            plants={plants}
            plantpots={plantpots}
            accessories={accessories}
            productType={productType}
            setProductType={setProductType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            renderProductItem={renderProductItem}
            handleAddProduct={handleAddProduct}
            loading={loading}
            getCurrentProducts={getCurrentProducts}
          />
        );
      case 'orders':
        return (
          <DonHangTab
            orders={orders}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            updateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case 'stats':
        return (
          <ThongKeTab
            userCount={userCount}
            orders={orders}
            plants={plants}
            plantpots={plantpots}
            accessories={accessories}
            totalRevenue={totalRevenue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tổng Quan</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.tabContent}>
            <View style={styles.topTabs}>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'products' && styles.activeTopTab]}
                onPress={() => setActiveSection('products')}
              >
                <Feather name="box" size={20} color={activeSection === 'products' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'products' && styles.activeTopTabText]}>SẢN PHẨM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'orders' && styles.activeTopTab]}
                onPress={() => setActiveSection('orders')}
              >
                <Feather name="file-text" size={20} color={activeSection === 'orders' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'orders' && styles.activeTopTabText]}>ĐƠN HÀNG</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'stats' && styles.activeTopTab]}
                onPress={() => setActiveSection('stats')}
              >
                <Feather name="bar-chart-2" size={20} color={activeSection === 'stats' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'stats' && styles.activeTopTabText]}>THỐNG KÊ</Text>
              </TouchableOpacity>
            </View>

            {renderTopTabContent()}

            {modalVisible && (
              <ProductModal
                formData={formData}
                setFormData={setFormData}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                isEditMode={isEditMode}
                handleSaveProduct={handleSaveProduct}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}