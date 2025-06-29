import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { router } from 'expo-router';
import { API_CONFIG } from '../../ApiService';

// Define types for our data
interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isAdmin?: boolean;
  cart?: CartItem[];
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface Plant {
  id: string;
  name: string;
  price: string;
  image: string;
  lightPreference: string;
  quantity: number;
}

interface Pot {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface Accessory {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface Combo {
  id: string;
  name: string;
  image: string;
  subtitle: string;
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

interface OrderItem extends CartItem {
  type: 'plant' | 'pot' | 'accessory';
}

interface DataStats {
  totalUsers: number;
  totalPlants: number;
  totalPots: number;
  totalAccessories: number;
  totalCombos: number;
  totalOrders: number;
  totalRevenue: string;
}

// Your json-server URL
const API_URL = `${API_CONFIG.baseURL}`;

const AdminHomeScreen = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<User[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [pots, setPots] = useState<Pot[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DataStats>({
    totalUsers: 0,
    totalPlants: 0,
    totalPots: 0,
    totalAccessories: 0,
    totalCombos: 0,
    totalOrders: 0,
    totalRevenue: '0đ',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [usersResponse, plantsResponse, potsResponse, accessoriesResponse, combosResponse, ordersResponse] = 
        await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/plants`),
          axios.get(`${API_URL}/pots`),
          axios.get(`${API_URL}/accessories`),
          axios.get(`${API_URL}/combos`),
          axios.get(`${API_URL}/orders`)
        ]);
      
      // Store the raw data
      setUsers(usersResponse.data);
      setPlants(plantsResponse.data);
      setPots(potsResponse.data);
      setAccessories(accessoriesResponse.data);
      setCombos(combosResponse.data);
      setOrders(ordersResponse.data);
      
      // Calculate total revenue from orders
      let totalRevenue = 0;
      ordersResponse.data.forEach((order: Order) => {
        // Extract numeric value from price string (e.g. "1.040.000đ" -> 1040000)
        const amount = parseFloat(order.finalAmount.replace(/\./g, '').replace('đ', ''));
        totalRevenue += amount;
      });
      
      // Format total revenue as string with Vietnamese đồng format
      const formattedRevenue = totalRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
      
      // Update stats
      setStats({
        totalUsers: usersResponse.data.length,
        totalPlants: plantsResponse.data.length,
        totalPots: potsResponse.data.length,
        totalAccessories: accessoriesResponse.data.length,
        totalCombos: combosResponse.data.length,
        totalOrders: ordersResponse.data.length,
        totalRevenue: formattedRevenue,
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to navigate to different screens
  const navigateTo = (screen: string) => {
    switch(screen) {
      case 'PlantsManagement':
        router.push('/admin/PlantsScreen');
        break;
      case 'PotsManagement':
        router.push('/admin/PotsScreen');
        break;
      case 'AccessoriesManagement':
        router.push('/admin/AccessoriesScreen');
        break;
      case 'CombosManagement':
        router.push('/admin/CombosScreen');
        break;
      case 'UsersManagement':
        // Navigate to users management screen when implemented
        router.push('/admin/UsersScreen')
        break;
      case 'OrdersManagement':
        router.push('/admin/OrdersScreen')
        break;
      case 'Settings':
        router.push('/admin/SettingsScreen')
        break;
      default:
        console.log(`Navigating to ${screen}`);
    }
  };

  const logout = () => {
    // Implement logout logic here
    console.log('Logging out');
  };

  const CategoryCard = ({ title, count, onPress, icon }: { title: string; count: number; onPress: () => void; icon: string }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={onPress}
    >
      <Icon name={icon} size={24} color="#4a9f58" style={styles.categoryIcon} />
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryCount}>{count}</Text>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f0f0f0" barStyle="dark-content" />
      
      <View style={styles.header}>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Tổng quan</Text>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tổng doanh thu</Text>
            <Text style={styles.statValue}>{stats.totalRevenue}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Đơn hàng</Text>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Quản lý sản phẩm</Text>
        
        <View style={styles.categories}>
          <View style={styles.categoryRow}>
            <CategoryCard 
              title="Cây" 
              count={stats.totalPlants} 
              onPress={() => navigateTo('PlantsManagement')} 
              icon="aperture"
            />
            <CategoryCard 
              title="Chậu" 
              count={stats.totalPots} 
              onPress={() => navigateTo('PotsManagement')} 
              icon="box"
            />
          </View>
          
          <View style={styles.categoryRow}>
            <CategoryCard 
              title="Phụ kiện" 
              count={stats.totalAccessories} 
              onPress={() => navigateTo('AccessoriesManagement')} 
              icon="tool"
            />
            <CategoryCard 
              title="Combo" 
              count={stats.totalCombos} 
              onPress={() => navigateTo('CombosManagement')} 
              icon="package"
            />
          </View>
        </View>
        
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Khách hàng</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigateTo('UsersManagement')}
          >
            <Text style={styles.viewAllText}>Xem tất cả ({stats.totalUsers})</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          {orders.length > 0 ? (
            <>
              {orders.slice(0, 2).map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <View style={[
                      styles.statusBadge,
                      order.status === 'Đã hoàn thành' ? styles.completedStatus : styles.processingStatus
                    ]}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderCustomer}>{order.customerInfo.fullName}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderItems}>{order.items.length} sản phẩm</Text>
                    <Text style={styles.orderTotal}>{order.finalAmount}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigateTo('OrdersManagement')}
              >
                <Text style={styles.viewAllText}>Xem tất cả ({stats.totalOrders})</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Chưa có đơn hàng nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]} onPress={() => {}}>
          <Icon name="home" size={20} color="#4a9f58" />
          <Text style={styles.activeTabText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('OrdersManagement')}>
          <Icon name="shopping-bag" size={20} color="#777" />
          <Text style={styles.tabText}>Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('UsersManagement')}>
          <Icon name="users" size={20} color="#777" />
          <Text style={styles.tabText}>Khách hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Settings')}>
          <Icon name="settings" size={20} color="#777" />
          <Text style={styles.tabText}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    justifyContent: 'space-between',
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
  headerButton: {
    color: '#4a9f58',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a9f58',
  },
  categories: {
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    elevation: 1,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  categoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9f58',
  },
  usersSection: {
    marginBottom: 24,
  },
  viewAllButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
  },
  viewAllText: {
    color: '#4a9f58',
    fontWeight: 'bold',
  },
  ordersSection: {
    marginBottom: 70, // Extra space for tab bar
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a9f58',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
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
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#4a9f58',
  },
  tabText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  activeTabText: {
    fontSize: 12,
    color: '#4a9f58',
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default AdminHomeScreen;