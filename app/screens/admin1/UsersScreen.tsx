import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { API_CONFIG } from '../../ApiService';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

// API URL
const API_URL = `${API_CONFIG.baseURL}`;

// Interface for User
interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  password: string;
  isAdmin?: boolean;
}

const UsersScreen = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (screen: string, params?: any) => {
    if (screen === 'UserDetail' && params) {
      // Navigate to user detail screen with the user ID
      console.log('Navigating to user detail:', params.userId);
      // Implement navigation to user detail screen
      // router.push(`/admin/UserDetail?id=${params.userId}`);
    } else if (screen === 'Home') {
      router.push('../admin1/main');
    } else if (screen === 'Orders') {
      router.push('../admin1/OrdersScreen');
    } else if (screen === 'Settings') {
        router.push('../admin1/SettingsScreen');
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigateTo('UserDetail', { userId: item.id })}
    >
      <View>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userInfo}>{item.email}</Text>
        <Text style={styles.userInfo}>Sđt: {item.phoneNumber}</Text>
        {item.address && <Text style={styles.userInfo}>{item.address}</Text>}
      </View>
      
      {item.isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Icon name="users" size={50} color="#ddd" />
      <Text style={styles.emptyStateText}>Không có khách hàng nào</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý khách hàng</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Home')}>
          <Icon name="home" size={20} color="#777" />
          <Text style={styles.tabItemText}>Trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Orders')}>
          <Icon name="shopping-bag" size={20} color="#777" />
          <Text style={styles.tabItemText}>Đơn hàng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Icon name="users" size={20} color="#4a9f58" />
          <Text style={styles.activeTabItemText}>Khách hàng</Text>
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
  listContainer: {
    padding: 8,
    paddingBottom: 70, // Extra space for tab bar
  },
  userCard: {
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  adminBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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

export default UsersScreen;