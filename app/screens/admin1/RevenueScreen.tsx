import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  FlatList,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import { API_CONFIG } from '../../ApiService';

// API URL - Replace with your actual API endpoint
const API_URL = `${API_CONFIG.baseURL}`;

// Interface for Order
interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  userId: string;
  products: OrderProduct[];
}

interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

// Simple custom date picker modal
const CustomDatePicker = ({ 
  isVisible, 
  onClose, 
  onDateSelected, 
  currentDate 
}: { 
  isVisible: boolean; 
  onClose: () => void; 
  onDateSelected: (date: Date) => void; 
  currentDate: Date 
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  
  // Create arrays for days, months, years for the picker
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const days = Array.from(
    { length: daysInMonth(selectedDate.getMonth() + 1, selectedDate.getFullYear()) }, 
    (_, i) => i + 1
  );
  
  const handleConfirm = () => {
    onDateSelected(selectedDate);
    onClose();
  };
  
  const setDay = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };
  
  const setMonth = (month: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(month - 1);
    
    // Ensure we don't have invalid date (e.g., Feb 30)
    const daysInNewMonth = daysInMonth(month, newDate.getFullYear());
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }
    
    setSelectedDate(newDate);
  };
  
  const setYear = (year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    
    // Handle February in leap years
    const month = newDate.getMonth() + 1;
    const daysInNewMonth = daysInMonth(month, year);
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }
    
    setSelectedDate(newDate);
  };
  
  if (!isVisible) return null;
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>Chọn ngày</Text>
          
          <View style={modalStyles.pickerContainer}>
            <View style={modalStyles.pickerColumn}>
              <Text style={modalStyles.pickerLabel}>Ngày</Text>
              <View style={modalStyles.picker}>
                {days.map(day => (
                  <TouchableOpacity 
                    key={`day-${day}`}
                    style={[
                      modalStyles.pickerItem,
                      selectedDate.getDate() === day && modalStyles.selectedItem
                    ]}
                    onPress={() => setDay(day)}
                  >
                    <Text 
                      style={[
                        modalStyles.pickerItemText,
                        selectedDate.getDate() === day && modalStyles.selectedItemText
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={modalStyles.pickerColumn}>
              <Text style={modalStyles.pickerLabel}>Tháng</Text>
              <View style={modalStyles.picker}>
                {months.map(month => (
                  <TouchableOpacity 
                    key={`month-${month}`}
                    style={[
                      modalStyles.pickerItem,
                      selectedDate.getMonth() + 1 === month && modalStyles.selectedItem
                    ]}
                    onPress={() => setMonth(month)}
                  >
                    <Text 
                      style={[
                        modalStyles.pickerItemText,
                        selectedDate.getMonth() + 1 === month && modalStyles.selectedItemText
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={modalStyles.pickerColumn}>
              <Text style={modalStyles.pickerLabel}>Năm</Text>
              <View style={modalStyles.picker}>
                {years.map(year => (
                  <TouchableOpacity 
                    key={`year-${year}`}
                    style={[
                      modalStyles.pickerItem,
                      selectedDate.getFullYear() === year && modalStyles.selectedItem
                    ]}
                    onPress={() => setYear(year)}
                  >
                    <Text 
                      style={[
                        modalStyles.pickerItemText,
                        selectedDate.getFullYear() === year && modalStyles.selectedItemText
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity style={modalStyles.button} onPress={onClose}>
              <Text style={modalStyles.buttonText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[modalStyles.button, modalStyles.confirmButton]} 
              onPress={handleConfirm}
            >
              <Text style={[modalStyles.buttonText, modalStyles.confirmButtonText]}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RevenueScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Date range state
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30))); // Default to last 30 days
  const [endDate, setEndDate] = useState(new Date());
  
  // Date picker visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrdersByDateRange();
  }, [orders, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/orders?status=Đã hoàn thành`);
      
      if (response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      // For demo purposes - create some mock data if API fails
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate mock orders for demo purposes
  const generateMockOrders = (): Order[] => {
    const mockOrders: Order[] = [];
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days
      
      const totalAmount = Math.floor(Math.random() * 5000000) + 100000; // Random amount between 100,000đ and 5,000,000đ
      
      mockOrders.push({
        id: `order-${i}`,
        orderDate: orderDate.toISOString(),
        totalAmount: totalAmount,
        status: 'completed',
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        products: [
          {
            productId: `product-${Math.floor(Math.random() * 20) + 1}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            price: Math.floor(Math.random() * 300000) + 50000
          }
        ]
      });
    }
    
    return mockOrders;
  };

  const filterOrdersByDateRange = () => {
    const filteredData = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  
    setFilteredOrders(filteredData);
    
    // Fix for Vietnamese currency format (periods as thousand separators)
    let total = 0;
    filteredData.forEach((order: Order) => {
      // First convert to string
      const amountStr = String(order.totalAmount);
      
      // Remove the currency symbol (đ) and any spaces
      const cleanStr = amountStr.replace(/[đ\s]/g, '');
      
      // For Vietnamese format: replace all periods (thousand separators) with empty string
      // and if there's a comma for decimal, replace it with a period
      const normalizedStr = cleanStr.replace(/\./g, '').replace(/,/g, '.');
      
      // Parse to float
      const amount = parseFloat(normalizedStr);
      
      // Only add if it's a valid number
      if (!isNaN(amount)) {
        total += amount;
      }
    });
    
    setTotalRevenue(total);
  };

  const handleStartDateSelected = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateSelected = (date: Date) => {
    setEndDate(date);
  };

  const formatDate = (date: Date | string) => {
    return moment(date).format('DD/MM/YYYY');
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') ;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>
          {formatDate(item.orderDate)}
        </Text>
        <Text style={styles.orderId}>
          #{item.id}
        </Text>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>
          {formatCurrency(item.totalAmount)}
        </Text>
      </View>
    </View>
  );

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doanh thu</Text>
        <View style={styles.backButton} />
      </View>
      
      {/* Date Filter Section */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateLabel}>Từ ngày</Text>
          <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          <View style={styles.dateUnderline} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateLabel}>Đến ngày</Text>
          <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          <View style={styles.dateUnderline} />
        </TouchableOpacity>
      </View>
      
      {/* Custom Date Pickers */}
      <CustomDatePicker 
        isVisible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onDateSelected={handleStartDateSelected}
        currentDate={startDate}
      />
      
      <CustomDatePicker 
        isVisible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onDateSelected={handleEndDateSelected}
        currentDate={endDate}
      />
      
      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9f58" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.ordersList}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Icon name="inbox" size={48} color="#cccccc" />
              <Text style={styles.emptyListText}>Không có dữ liệu doanh thu trong khoảng thời gian đã chọn</Text>
            </View>
          }
        />
      )}
      
      {/* Total Revenue Footer */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng doanh thu: {formatCurrency(totalRevenue)} đ</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  dateUnderline: {
    height: 1,
    backgroundColor: '#dddddd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  orderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
  },
  orderId: {
    fontSize: 14,
    color: '#888',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a9f58',
  },
  emptyListContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eeeeee',
    padding: 16,
    alignItems: 'center',
    elevation: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  picker: {
    height: 200,
    overflow: 'scroll',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4a9f58',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default RevenueScreen;