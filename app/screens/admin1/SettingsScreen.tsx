import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Image,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../ApiService';

// API URL
const API_URL = `${API_CONFIG.baseURL}`;

// Interface for Admin User
interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isAdmin: boolean;
}

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would get the current user from auth context or AsyncStorage
      // This is just a simulation to get an admin user
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        if (response.data && response.data.isAdmin) {
          setCurrentUser(response.data);
        } else {
          // Fallback to find an admin user if no current user is found
          const allUsers = await axios.get(`${API_URL}/users?isAdmin=true`);
          if (allUsers.data && allUsers.data.length > 0) {
            setCurrentUser(allUsers.data[0]);
          }
        }
      } else {
        // Fallback to find an admin user if no current user is found
        const allUsers = await axios.get(`${API_URL}/users?isAdmin=true`);
        if (allUsers.data && allUsers.data.length > 0) {
          setCurrentUser(allUsers.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (screen: string) => {
    if (screen === 'Home') {
      router.push('../admin1/main');
    } else if (screen === 'Orders') {
      router.push('../admin1/OrdersScreen');
    } else if (screen === 'Customers') {
      router.push('../admin1/UsersScreen');
    }
  };

  const handleMenuPress = (option: string) => {
    switch(option) {
      case 'qa':
        Alert.alert('Q&A', 'Chức năng đang được phát triển');
        break;
      case 'revenue':
        router.push('../admin1/RevenueScreen')
        break;
      case 'privacy':
        Alert.alert('Chính sách quyền riêng tư', 'Chức năng đang được phát triển');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('userToken');
              
              router.push('../login')
              Alert.alert('Thành công', 'Đã đăng xuất thành công');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={require('@/assets/images/ic_user.webp')} 
              style={styles.profileImage}
              defaultSource={require('@/assets/images/ic_user.webp')}
              // If you don't have the image, use this instead:
              // style={[styles.profileImage, { backgroundColor: '#f0f0f0' }]}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {currentUser ? currentUser.fullName : 'Admin'}
            </Text>
            <Text style={styles.profileEmail}>
              {currentUser ? currentUser.email : 'admin@gmail.com'}
            </Text>
          </View>
        </View>
        
        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('qa')}
          >
            <Text style={styles.menuText}>Q&A</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('revenue')}
          >
            <Text style={styles.menuText}>Doanh thu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('privacy')}
          >
            <Text style={styles.menuText}>Chính sách quyền riêng tư</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('logout')}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Phiên bản: 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 PlantShop. All rights reserved.</Text>
        </View>
      </ScrollView>
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Home')}>
          <Icon name="home" size={20} color="#777" />
          <Text style={styles.tabItemText}>Trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Orders')}>
          <Icon name="shopping-bag" size={20} color="#777" />
          <Text style={styles.tabItemText}>Đơn hàng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigateTo('Customers')}>
          <Icon name="users" size={20} color="#777" />
          <Text style={styles.tabItemText}>Khách hàng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Icon name="settings" size={20} color="#4a9f58" />
          <Text style={styles.activeTabItemText}>Cài đặt</Text>
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
  content: {
    flex: 1,
    paddingBottom: 70, // Extra space for tab bar
  },
  profileSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
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

export default SettingsScreen;