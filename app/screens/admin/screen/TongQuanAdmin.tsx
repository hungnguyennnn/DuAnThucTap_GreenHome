
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator, TextInput, FlatList, Modal, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Feather, AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Import từ các file đã tách
import { 
  Product, 
  FormData, 
  fetchProducts, 
  deleteProduct, 
  saveProduct, 
  filterProducts, 
  validateProductForm 
} from '../services/sanpham';
import { Order, fetchOrders,updateOrderStatus, translateOrderStatus } from '../services/donhang';
import { fetchStats } from '../services/thongke';

export default function TongQuanAdmin() {
  const [activeSection, setActiveSection] = useState('products');
  // FIX 1: Đổi về 'plant' thay vì 'plants' để khớp với type từ backend
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
  const [totalRevenue, setTotalRevenue] = useState<string>("0đ");

  // FIX 2: Cập nhật FormData để khớp với backend
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    price: '',
    image: '',
    quantity: '0',
    lightPreference: 'Ưa sáng',
    type: 'plant' // Khớp với backend type
  });

  // Tải dữ liệu khi component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // FIX 3: Cập nhật logic phân loại sản phẩm
  const loadAllData = async () => {
    setLoading(true);
    
    try {
      const productData = await fetchProducts(); 
      console.log('📦 Dữ liệu sản phẩm từ API:', productData);

      // Phân loại sản phẩm theo type từ backend
      const plantsData = productData.filter(p => p.type === 'plant');
      const plantpotsData = productData.filter(p => p.type === 'plantpot' || p.type === 'pot');
      const accessoriesData = productData.filter(p => p.type === 'accessory');

      console.log('🌱 Cây cối:', plantsData.length);
      console.log('🪴 Chậu cây:', plantpotsData.length);
      console.log('🔧 Phụ kiện:', accessoriesData.length);

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

  // Tính doanh thu
  const calculateTotalRevenue = (orderList: Order[]): string => {
    let total = 0;
    orderList.forEach(order => {
      const price = parseInt(order.totalPrice.replace(/[^\d]/g, ''), 10);
      if (!isNaN(price)) total += price;
    });
    return total.toLocaleString('vi-VN') + 'đ';
  };

  // FIX 4: Cập nhật logic lấy sản phẩm hiện tại
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
        console.warn('⚠️ Không xác định loại sản phẩm:', productType);
        list = [...plants, ...plantpots, ...accessories];
    }

    console.log(`🔍 Sản phẩm ${productType}:`, list.length);
    const filtered = filterProducts(list, searchQuery);
    console.log(`🔍 Sau khi lọc "${searchQuery}":`, filtered.length);
    
    return filtered;
  };

  // Mở modal thêm
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
      type: productType
    });
    setModalVisible(true);
  };

  // Mở modal sửa
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
      type: product.type
    });
    setModalVisible(true);
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await deleteProduct(product.id);
            if (success) {
              loadAllData();
              Alert.alert("Thành công", "Đã xóa sản phẩm thành công!");
            } else {
              Alert.alert("Lỗi", "Không thể xóa sản phẩm. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  };

  // Lưu sản phẩm (thêm hoặc sửa)
  const handleSaveProduct = async () => {
    if (!validateProductForm(formData)) return;

    const success = await saveProduct(formData, isEditMode, currentProduct?.id);

    if (success) {
      loadAllData();
      setModalVisible(false);
      Alert.alert(
        "Thành công",
        isEditMode ? "Sản phẩm đã được cập nhật!" : "Sản phẩm mới đã được thêm!"
      );
    } else {
      Alert.alert("Lỗi", "Không thể lưu sản phẩm. Vui lòng thử lại sau.");
    }
  };

  // Thêm hàm filterOrders để lọc đơn hàng theo ID
  const filterOrders = (orders: Order[], query: string): Order[] => {
    if (!query.trim()) {
      return orders;
    }
    
    const lowerCaseQuery = query.toLowerCase().trim();
    
    return orders.filter(order => 
      order.id.toLowerCase().includes(lowerCaseQuery) ||
      order.fullName.toLowerCase().includes(lowerCaseQuery) ||
      order.phoneNumber.includes(lowerCaseQuery)
    );
  };

  // FIX 5: Cập nhật render product item để hiển thị đúng thông tin
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
        <Text style={styles.productStock}>Tồn kho: {item.quantity}</Text>
        <Text style={styles.productDetail}>Kích thước: {item.size || 'Không rõ'}</Text>
        <Text style={styles.productDetail}>Xuất xứ: {item.origin || 'Không rõ'}</Text>

        {item.type === 'plant' && item.character && (
          <Text style={styles.productLight}>Tính chất: {item.character}</Text>
        )}

        {item.new && (
          <Text style={[styles.productNewTag]}>Mới</Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditProduct(item)}
        >
          <Feather name="edit" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item)}
        >
          <Feather name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Hiển thị danh sách sản phẩm với FlatList và tìm kiếm
  const renderProductList = () => {
    const currentProducts = getCurrentProducts();
    const productTypeTitle = 
      productType === 'plant' ? 'Loại Cây' : 
      productType === 'plantpot' ? 'Loại Chậu' : 'Phụ Kiện';
    
    return (
      <View style={styles.productSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.productSectionTitle}>{productTypeTitle}</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
          </View>
        </View>
        <Text style={styles.totalCount}>Tổng số: {currentProducts.length} sản phẩm</Text>
        
        <FlatList
          data={currentProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? 'Đang tải...' : 'Không tìm thấy sản phẩm nào'}
            </Text>
          }
        />

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render nội dung cho tab sản phẩm
  const renderProductsContent = () => {
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Quản Lý Sản Phẩm</Text>
        
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, productType === 'plant' && styles.activeStatCard]} 
            onPress={() => setProductType('plant')}
          >
            <Text style={styles.statNumber}>{plants.length}</Text>
            <Text style={styles.statLabel}>Loại cây</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, productType === 'plantpot' && styles.activeStatCard]} 
            onPress={() => setProductType('plantpot')}
          >
            <Text style={styles.statNumber}>{plantpots.length}</Text>
            <Text style={styles.statLabel}>Loại chậu</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, productType === 'accessory' && styles.activeStatCard]} 
            onPress={() => setProductType('accessory')}
          >
            <Text style={styles.statNumber}>{accessories.length}</Text>
            <Text style={styles.statLabel}>Phụ kiện</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#007537" style={styles.loader} />
        ) : (
          renderProductList()
        )}
      </View>
    );
  };

  // Render nội dung cho tab đơn hàng
  const renderOrdersContent = () => {
    const filteredOrders = filterOrders(orders, searchQuery);
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Quản Lý Đơn Hàng</Text>
        <View style={styles.searchContainerDn}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#007537" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderID}>#{item.id}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                
                <View style={styles.orderDetails}>
                  <Text style={styles.orderInfo}>
                    <Text style={styles.orderLabel}>Khách hàng: </Text>
                    {item.fullName}
                  </Text>
                  <Text style={styles.orderInfo}>
                    <Text style={styles.orderLabel}>SĐT: </Text>
                    {item.phoneNumber}
                  </Text>
                  <Text style={styles.orderInfo}>
                    <Text style={styles.orderLabel}>Địa chỉ: </Text>
                    {item.address}
                  </Text>
                  <Text style={styles.orderInfo}>
                    <Text style={styles.orderLabel}>Số lượng sản phẩm: </Text>
                    {item.products.length}
                  </Text>
                  <Text style={styles.orderPrice}>Tổng tiền: {item.totalPrice}</Text>
                  <Text style={styles.orderPayment}>
                    Phương thức: {item.paymentMethod === 'cod' ? 'Tiền mặt khi nhận hàng' : 'Chuyển khoản'}
                  </Text>
                </View>
                
                <View style={styles.orderActions}>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'pending' ? styles.statusPending : styles.statusCompleted
                  ]}>
                    <Text style={styles.statusText}>
                      {translateOrderStatus(item.status)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.statusUpdateButton}
                    onPress={() => handleUpdateOrderStatus(item)}
                  >
                    <Text style={styles.updateButtonText}>
                      {item.status === 'pending' ? 'Đánh dấu hoàn thành' : 'Đánh dấu đang xử lý'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
            }
          />
        )}
      </View>
    );
  };

  // Thêm hàm xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (order: Order) => {
    const newStatus = order.status === 'pending' ? 'completed' : 'pending';
    
    Alert.alert(
      "Xác nhận thay đổi",
      `Bạn có chắc muốn chuyển trạng thái đơn hàng sang "${translateOrderStatus(newStatus)}"?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            setLoading(true);
            const success = await updateOrderStatus(order.id, newStatus);
            
            if (success) {
              const orderData = await fetchOrders();
              setOrders(orderData);
              
              Alert.alert(
                "Thành công", 
                `Đã cập nhật trạng thái đơn hàng thành "${translateOrderStatus(newStatus)}"`
              );
            } else {
              Alert.alert(
                "Lỗi", 
                "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau."
              );
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Render nội dung cho tab thống kê
  const renderStatsContent = () => {
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Thống Kê</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userCount}</Text>
            <Text style={styles.statLabel}>Người dùng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{plants.length}</Text>
            <Text style={styles.statLabel}>Cây</Text>
            <Text style={styles.statNumber}>{plantpots.length}</Text>
            <Text style={styles.statLabel}>Chậu</Text>
            <Text style={styles.statNumber}>{accessories.length}</Text>
            <Text style={styles.statLabel}>Phụ kiện</Text>
          </View>
        </View>
        
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Tổng doanh thu:</Text>
          <Text style={styles.revenueNumber}>{totalRevenue}</Text>
        </View>
      </View>
    );
  };

  // Content for top tabs
  const renderTopTabContent = () => {
    switch (activeSection) {
      case 'products':
        return renderProductsContent();
      case 'orders':
        return renderOrdersContent();
      case 'stats':
        return renderStatsContent();
      default:
        return null;
    }
  };

  // FIX 6: Cập nhật Modal để khớp với backend
  const renderProductModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại sản phẩm</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  style={styles.picker}
                  onValueChange={(itemValue:any) => 
                    setFormData({...formData, type: itemValue})
                  }
                >
                  <Picker.Item label="Cây" value="plant" />
                  <Picker.Item label="Chậu" value="plantpot" />
                  <Picker.Item label="Phụ kiện" value="accessory" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên sản phẩm</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Nhập tên sản phẩm"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá</Text>
              <TextInput
                style={styles.formInput}
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text})}
                placeholder="Ví dụ: 250.000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>URL Hình ảnh</Text>
              <TextInput
                style={styles.formInput}
                value={formData.image}
                onChangeText={(text) => setFormData({...formData, image: text})}
                placeholder="Nhập URL hình ảnh"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số lượng tồn kho</Text>
              <TextInput
                style={styles.formInput}
                value={formData.quantity}
                onChangeText={(text) => setFormData({...formData, quantity: text})}
                placeholder="Nhập số lượng"
                keyboardType="numeric"
              />
            </View>

            {formData.type === 'plant' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ánh sáng phù hợp</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.lightPreference}
                    style={styles.picker}
                    onValueChange={(itemValue:any) => 
                      setFormData({...formData, lightPreference: itemValue})
                    }
                  >
                    <Picker.Item label="Ưa sáng" value="Ưa sáng" />
                    <Picker.Item label="Ưa bóng" value="Ưa bóng" />
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProduct}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
            {/* Top Navigation */}
            <View style={styles.topTabs}>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'products' && styles.activeTopTab]}
                onPress={() => setActiveSection('products')}
              >
                <Feather name="box" size={20} color={activeSection === 'products' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'products' && styles.activeTopTabText]}>
                  SẢN PHẨM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'orders' && styles.activeTopTab]}
                onPress={() => setActiveSection('orders')}
              >
                <Feather name="file-text" size={20} color={activeSection === 'orders' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'orders' && styles.activeTopTabText]}>
                  ĐƠN HÀNG
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'stats' && styles.activeTopTab]}
                onPress={() => setActiveSection('stats')}
              >
                <Feather name="bar-chart-2" size={20} color={activeSection === 'stats' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'stats' && styles.activeTopTabText]}>
                  THỐNG KÊ
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Tab Content */}
            {renderTopTabContent()}
            
            {/* Modal thêm/sửa sản phẩm */}
            {renderProductModal()}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007537',
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  topTabs: {
    flexDirection: 'row',
    backgroundColor: '#007537',
    height: 50,
  },
  topTabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTopTab: {
    borderBottomWidth: 3,
    borderBottomColor: 'white',
  },
  topTabText: {
    fontSize: 12,
    color: '#e0e0e0',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  activeTopTabText: {
    color: 'white',
  },
  sectionContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  activeStatCard: {
    borderColor: '#007537',
    borderWidth: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007537',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
 
  productSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007537',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    width: '50%',
  },
 
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  searchIcon: {
    marginLeft: 8,
  },
  totalCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#007537',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  productDetail: {
    fontSize: 12,
    color: '#444',
  },

  productNewTag: {
    marginTop: 4,
    fontSize: 12,
    color: 'white',
    backgroundColor: '#e91e63',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },

  productLight: {
    fontSize: 12,
    color: '#007537',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  loader: {
    marginTop: 30,
  },
  
  // Styles cho orders
  ordersList: {
    marginTop: 8,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainerDn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom:10
  },
  orderID: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusPending: {
    backgroundColor: '#ffcc00',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusCompleted: {
    backgroundColor: '#28a745',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Styles cho nút thêm, sửa, xóa
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ff7043',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 15,
    bottom:5,
    backgroundColor: '#007537',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
  // Styles cho modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderDetails: {
    marginVertical: 8,
  },
  orderLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007537',
    marginTop: 4,
  },
  orderPayment: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statusBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },

  statusUpdateButton: {
    backgroundColor: '#007537',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  revenueCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  revenueNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007537',
  },
});
