import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../configs/api';
import AppHeader from '../components/AppHeader';
import { fetchOrderHistory } from '../redux/actions/paymentActions';
import { RootState } from '../redux/store/store';
import { AnyAction } from '@reduxjs/toolkit';
import { ThunkDispatch } from 'redux-thunk';

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

const NO_IMAGE = "https://static.vecteezy.com/system/resources/previews/022/059/000/non_2x/no-image-available-icon-vector.jpg";

const OrderHistoryScreen = ({navigation} : any) => {
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
    const { orders, loading, error } = useSelector((state: RootState) => state.payment);
    const { user } = useSelector((state: RootState) => state.auth);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        setRefreshing(true);
        await dispatch(fetchOrderHistory());
        setRefreshing(false);
    };

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
                        source={{ uri: item.productImage || NO_IMAGE }} 
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
                        <Text style={styles.name}>{item.items[0].name} | <Text style={styles.quantity}>Ưa bóng</Text></Text>
                        <Text style={styles.quantity}>{item.items.length} sản phẩm</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem lịch sử đơn hàng</Text>
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
                <Text style={styles.loadingText}>Đang tải danh sách đơn hàng...</Text>
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
            <AppHeader title="LỊCH SỬ GIAO DỊCH" navigation={navigation}/>
            <View style={{height: 20}}/>
            {orders.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    onRefresh={loadOrders}
                    refreshing={refreshing}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 25
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
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
        marginBottom: 10,
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

export default OrderHistoryScreen; 