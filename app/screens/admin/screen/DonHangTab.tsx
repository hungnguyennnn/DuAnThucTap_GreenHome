import React from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/TongQuanAdmin.styles';
import { Order, translateOrderStatus, translatePaymentMethod, translateDeliveryMethod } from '../services/donhang';

interface Props {
    orders: Order[];
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    updateOrderStatus: (order: Order) => void;
}

const DonHangTab: React.FC<Props> = ({
    orders,
    loading,
    searchQuery,
    setSearchQuery,
    updateOrderStatus
}) => {
    const filterOrders = (): Order[] => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter(order =>
            order.id.toLowerCase().includes(q) ||
            order.userId.toLowerCase().includes(q) ||
            order.phone.includes(q) ||
            order.address.toLowerCase().includes(q)
        );
    };

    const filteredOrders = filterOrders();

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Không xác định';
        }
    };

    const formatPrice = (price?: number): string => {
        if (typeof price !== 'number' || isNaN(price)) return '0đ';
        return price.toLocaleString('vi-VN') + 'đ';
    };


    return (
        <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Quản Lý Đơn Hàng</Text>

            <View style={styles.searchContainerDn}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm theo ID, SĐT, địa chỉ..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
            </View>

            <Text style={styles.totalCount}>Tổng số: {filteredOrders.length} đơn hàng</Text>

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
                                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                            </View>

                            <View style={styles.orderDetails}>
                                <Text style={styles.orderInfo}>
                                    <Text style={styles.orderLabel}>Mã khách hàng: </Text>
                                    {item.userId}
                                </Text>
                                <Text style={styles.orderInfo}>
                                    <Text style={styles.orderLabel}>SĐT: </Text>
                                    {item.phone}
                                </Text>
                                <Text style={styles.orderInfo}>
                                    <Text style={styles.orderLabel}>Địa chỉ: </Text>
                                    {item.address}
                                </Text>

                                {/* Hiển thị danh sách sản phẩm */}
                                <View style={styles.productsContainer}>
                                    <Text style={styles.orderLabel}>Sản phẩm:</Text>
                                    {Array.isArray(item.items) && item.items.length > 0 ? (
                                        item.items.map((product, index) => (
                                            <Text key={index} style={styles.productItem}>
                                                • {product.name} - SL: {product.quantity} - Giá: {product.price}đ
                                            </Text>
                                        ))
                                    ) : (
                                        <Text style={styles.productItem}>Không có sản phẩm</Text>
                                    )}
                                </View>

                                <Text style={styles.orderInfo}>
                                    <Text style={styles.orderLabel}>Phí vận chuyển: </Text>
                                    {formatPrice(item.shippingFee)}
                                </Text>
                                <Text style={styles.orderPrice}>
                                    Tổng tiền: {formatPrice((item.total || 0) + (item.shippingFee || 0))}
                                </Text>
                                <Text style={styles.orderPayment}>
                                    Thanh toán: {translatePaymentMethod(item.payMethod)}
                                </Text>
                                <Text style={styles.orderDelivery}>
                                    Giao hàng: {translateDeliveryMethod(item.deliveryMethod)}
                                </Text>
                            </View>

                            <View style={styles.orderActions}>
                                <View style={[
                                    styles.statusBadge,
                                    item.status === 'pending' ? styles.statusPending : styles.statusCompleted
                                ]}>
                                    <Text style={styles.statusText}>{translateOrderStatus(item.status)}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.statusUpdateButton}
                                    onPress={() => updateOrderStatus(item)}
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
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default DonHangTab;