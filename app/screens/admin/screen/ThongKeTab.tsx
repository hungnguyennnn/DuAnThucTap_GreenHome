import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/TongQuanAdmin.styles';
import { Product } from '../services/sanpham';
import { Order } from '../services/donhang';

interface Props {
  userCount: number;
  orders: Order[];
  plants: Product[];
  plantpots: Product[];
  accessories: Product[];
  totalRevenue: string;
}

const ThongKeTab: React.FC<Props> = ({
  userCount,
  orders,
  plants,
  plantpots,
  accessories,
  totalRevenue
}) => {
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

export default ThongKeTab;
