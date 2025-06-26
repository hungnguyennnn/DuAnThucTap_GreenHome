import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppHeader from '../components/AppHeader';
import { RootState } from '../redux/store/store';
import { clearUnreadNotifications } from '../redux/slices/paymentSlice';
import { fetchOrderHistory } from '../redux/actions/paymentActions';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import { useFocusEffect } from '@react-navigation/native';

interface OrderItem {
    id: string;
    status: string;
    createdAt: string;
    items: Array<{
        id: string;
        name: string;
        price: string;
        quantity: number;
    }>;
}

interface OrderItemWithImage extends OrderItem {
    productImage?: string;
}

const NO_IMAGE = "https://vanchuyentrungquoc247.com/wp-content/uploads/2015/04/icon-giao-hang.png";

const NotificationScreen = ({navigation}: any) => {
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
    const { orders, loading, error } = useSelector((state: RootState) => state.payment);
    const { user } = useSelector((state: RootState) => state.auth);
    const [refreshing, setRefreshing] = useState(false);

    // Xóa số lượng thông báo chưa đọc khi vào màn hình
    useEffect(() => {
        dispatch(clearUnreadNotifications());
    }, []);

    // Tự động tải lại dữ liệu khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                if (user) {
                    setRefreshing(true);
                    await dispatch(fetchOrderHistory());
                    setRefreshing(false);
                }
            };
            loadData();
        }, [user])
    );

    const formatDate = (date: string) => {
        const d = new Date(date);
        return `Thứ ${d.getDay() + 1}, ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const renderItem = ({ item }: { item: OrderItemWithImage }) => {
        if (!item.items || item.items.length === 0) {
            return null;
        }

        return (
            <View style={styles.orderContainer}>
                <Text style={styles.dateHeader}>{formatDate(item.createdAt)}</Text>
                <View style={{borderBottomWidth: 0.5, borderColor: 'gray', marginBottom: 10}}/>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                    style={styles.orderItem}
                >
                    <Image 
                        source={{ 
                            uri: item.productImage || NO_IMAGE,
                            cache: 'force-cache',
                        }} 
                        style={styles.image}
                        defaultSource={require('../../assets/images/no_image_found.png')}
                    />
                    <View style={styles.info}>
                        <Text style={[
                            styles.status,
                            { color: item.status === 'completed' ? '#28a745' : '#dc3545' }
                        ]}>
                            {item.status === 'completed' ? 'Đặt hàng thành công' : 'Đã hủy đơn hàng'}
                        </Text>
                        <Text style={styles.name}>
                            {item.items[0].name}
                            {item.items.length > 1 ? ` và ${item.items.length - 1} sản phẩm khác` : ''}
                        </Text>
                        <Text style={styles.quantity}>{item.items.length} sản phẩm</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông báo</Text>
                <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="green" />
                <Text style={styles.loadingText}>Đang tải thông báo...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="THÔNG BÁO" navigation={navigation}/>
            <View style={{height: 20}}/>
            {orders.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    onRefresh={() => dispatch(fetchOrderHistory())}
                    refreshing={refreshing}
                />
            )}
        </View>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 25
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateHeader: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    orderContainer: {
        backgroundColor: '#fff',
    },
    orderItem: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    image: {
        width: 60,
        height: 60,
        marginRight: 15,
        resizeMode: 'contain',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    quantity: {
        fontSize: 14,
        color: '#666',
    },
    loadingText: {
        marginTop: 10,
        color: 'gray',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: '#007537',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
});
