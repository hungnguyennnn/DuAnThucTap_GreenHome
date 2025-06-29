import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { API_CONFIG } from '../../ApiService';

// API URL
const API_URL = `${API_CONFIG.baseURL}`;

// Interface for Order
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  type: 'plant' | 'pot' | 'accessory';
}

interface Order {
  id: string;
  userId: string;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: string;
  shippingFee: string;
  finalAmount: string;
  paymentMethod: string;
  status: string;
  orderDate: string;
}

const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'processing', 'completed'

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [activeTab, orders]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'all') {
      setFilteredOrders(orders);
    } else if (activeTab === 'processing') {
      setFilteredOrders(orders.filter(order => order.status === 'Đang xử lý'));
    } else if (activeTab === 'completed') {
      setFilteredOrders(orders.filter(order => order.status === 'Đã hoàn thành'));
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const navigateTo = (screen: string, params?: any) => {
    if (screen === 'OrderDetail' && params) {
      // Navigate to order detail screen with the order ID
      console.log('Navigating to order detail:', params.orderId);
      // Implement navigation to order detail screen
      // router.push(`/admin/OrderDetail?id=${params.orderId}`);
    } else if (screen === 'Home') {
      router.push('../admin1/main');
    } else if (screen === 'Customers') {
      // Navigate to customers management screen
      router.push('../admin1/UsersScreen');
    } else if (screen === 'Settings') {
      // Navigate to settings screen
      router.push('../admin1/SettingsScreen');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}`, {
        status: newStatus
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Show success message
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      // Show error message
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order#{item.id}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Đã hoàn thành' ? styles.completedStatus : styles.processingStatus
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Đã hoàn thành' ? styles.completedStatusText : styles.processingStatusText
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderCustomer}>{item.customerInfo.fullName}</Text>
        <Text style={styles.orderDate}>
          Ngày đặt: {new Date(item.orderDate).toLocaleDateString('vi-VN')}
        </Text>
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoText}>Tổng tiền: </Text>
          <Text style={styles.orderTotal}>{item.finalAmount}</Text>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoText}>Số lượng: </Text>
          <Text style={styles.orderItems}>{item.items.length} item</Text>
        </View>
      </View>
      
      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => navigateTo('OrderDetail', { orderId: item.id })}
        >
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
        
        {item.status !== 'Đã hoàn thành' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => updateOrderStatus(item.id, 'Đã hoàn thành')}
          >
            <Text style={styles.completeButtonText}>Đã hoàn thành</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Icon name="inbox" size={50} color="#ddd" />
      <Text style={styles.emptyStateText}>Không có đơn hàng nào</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9f58" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả ({orders.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'processing' && styles.activeTab]}
          onPress={() => handleTabChange('processing')}
        >
          <Text style={[styles.tabText, activeTab === 'processing' && styles.activeTabText]}>
            Đang xử lý ({orders.filter(order => order.status === 'Đang xử lý').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => handleTabChange('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Đã hoàn thành ({orders.filter(order => order.status === 'Đã hoàn thành').length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Home')}>
          <Icon name="home" size={20} color="#777" />
          <Text style={styles.tabItemText}>Trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]} onPress={() => {}}>
          <Icon name="shopping-bag" size={20} color="#4a9f58" />
          <Text style={styles.activeTabItemText}>Đơn hàng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Customers')}>
          <Icon name="users" size={20} color="#777" />
          <Text style={styles.tabItemText}>Khách hàng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Settings')}>
          <Icon name="settings" size={20} color="#777" />
          <Text style={styles.tabItemText}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 30
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4a9f58',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#f0f9f2',
    borderBottomWidth: 2,
    borderBottomColor: '#4a9f58',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#4a9f58',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 8,
    paddingBottom: 70, // Extra space for tab bar
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedStatus: {
    backgroundColor: '#e6f7ef',
  },
  processingStatus: {
    backgroundColor: '#fff8e6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedStatusText: {
    color: '#27ae60',
  },
  processingStatusText: {
    color: '#f39c12',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a9f58',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: '#4a9f58',
  },
  tabItemText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  activeTabItemText: {
    fontSize: 12,
    color: '#4a9f58',
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default OrdersScreen;