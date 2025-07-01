import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList, 
  ScrollView,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { Stack } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Order, fetchOrders } from '../services/donhang';
import { Product } from '../services/sanpham';

const { width } = Dimensions.get('window');

export default function TraCuuDoanhThu() {
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<string>('');
  const [dailyRevenue, setDailyRevenue] = useState<string>('');
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const allOrders = await fetchOrders();
      setOrders(allOrders);
      calculateStatistics(allOrders);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const calculateStatistics = (orderList: Order[]) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Doanh thu hôm nay
    const todayOrders = orderList.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && order.status === 'completed';
    });
    const todayRevenue = calculateRevenue(todayOrders);
    setDailyRevenue(formatCurrency(todayRevenue));

    // Doanh thu tháng này
    const monthOrders = orderList.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfMonth && order.status === 'completed';
    });
    const monthRevenue = calculateRevenue(monthOrders);
    setMonthlyRevenue(formatCurrency(monthRevenue));

    // Tổng doanh thu
    const completedOrders = orderList.filter(order => order.status === 'completed');
    const totalRev = calculateRevenue(completedOrders);
    setTotalRevenue(formatCurrency(totalRev));
  };

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const validateDate = (dateStr: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    
    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Kiểm tra phạm vi cơ bản
    if (dayNum < 1 || dayNum > 31 || 
        monthNum < 1 || monthNum > 12 || 
        yearNum < 2000 || yearNum > 2030) {
      return false;
    }
    
    // Kiểm tra ngày có hợp lệ không (ví dụ: 31/02 là không hợp lệ)
    const testDate = new Date(yearNum, monthNum - 1, dayNum);
    return testDate.getFullYear() === yearNum && 
           testDate.getMonth() === monthNum - 1 && 
           testDate.getDate() === dayNum;
  };

  const getOrdersInRange = (orders: Order[], startDate: Date, endDate: Date): Order[] => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate && order.status === 'completed';
    });
  };

  const calculateRevenue = (orders: Order[]): number => {
    return orders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);
  };

  const formatDateInput = (text: string, setter: (value: string) => void) => {
    // Chỉ cho phép nhập số và dấu /
    const cleaned = text.replace(/[^\d]/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    setter(formatted);
  };

  const handleTraCuu = async () => {
    if (!ngayBatDau || !ngayKetThuc) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (!validateDate(ngayBatDau) || !validateDate(ngayKetThuc)) {
      Alert.alert('Lỗi', 'Định dạng ngày không hợp lệ hoặc ngày không tồn tại. Vui lòng nhập theo định dạng dd/MM/yyyy.');
      return;
    }

    const startDate = parseDate(ngayBatDau);
    const endDate = parseDate(ngayKetThuc);

    if (startDate > endDate) {
      Alert.alert('Lỗi', 'Ngày bắt đầu không thể lớn hơn ngày kết thúc.');
      return;
    }

    setIsLoading(true);
    try {
      const filtered = getOrdersInRange(orders, startDate, endDate);
      const revenue = calculateRevenue(filtered);
      
      setFilteredOrders(filtered);
      setTotalRevenue(formatCurrency(revenue));
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tra cứu doanh thu.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilter = () => {
    setNgayBatDau('');
    setNgayKetThuc('');
    setFilteredOrders([]);
    calculateStatistics(orders);
  };

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <MaterialIcons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id.slice(-6)}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'completed' ? '#E8F5E8' : '#FFF3E0' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'completed' ? '#2E7D32' : '#F57C00' 
          }]}>
            {item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>
            Khách hàng: {orders.find(o => o.userId === item.userId)?.userId || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="shopping-cart" size={16} color="#666" />
          <Text style={styles.infoText}>
            Số món: {item.items?.length || 0} sản phẩm
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')} - {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatCurrency(item.total || 0)}</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Tra Cứu Doanh Thu',
          headerStyle: { backgroundColor: '#007537' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Thống Kê Tổng Quan</Text>
          
          {renderStatCard('Hôm nay', dailyRevenue, 'today', '#4CAF50')}
          {renderStatCard('Tháng này', monthlyRevenue, 'calendar-month', '#2196F3')}
          {renderStatCard('Tổng doanh thu', totalRevenue, 'trending-up', '#FF9800')}
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Tra Cứu Theo Khoảng Thời Gian</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="date-range" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="dd/MM/yyyy"
                value={ngayBatDau}
                onChangeText={(text) => formatDateInput(text, setNgayBatDau)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="date-range" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="dd/MM/yyyy"
                value={ngayKetThuc}
                onChangeText={(text) => formatDateInput(text, setNgayKetThuc)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.searchButton]} 
              onPress={handleTraCuu}
              disabled={isLoading}
            >
              <Feather name="search" size={18} color="white" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Đang tìm...' : 'Tra Cứu'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearFilter}
            >
              <MaterialIcons name="clear" size={18} color="#666" />
              <Text style={[styles.buttonText, { color: '#666' }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Section */}
        {filteredOrders.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Kết Quả Tra Cứu</Text>
              <View style={styles.resultSummary}>
                <Text style={styles.resultCount}>{filteredOrders.length} đơn hàng</Text>
                <Text style={styles.resultRevenue}>{totalRevenue}</Text>
              </View>
            </View>

            <FlatList
              data={filteredOrders}
              keyExtractor={item => item.id}
              renderItem={renderOrderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Stats Section
  statsSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIconContainer: {
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Search Section
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  searchButton: {
    backgroundColor: '#007537',
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Results Section
  resultsSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultCount: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  resultRevenue: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },

  // Order Card
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007537',
  },
});