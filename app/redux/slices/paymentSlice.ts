import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderItem {
    id: string;
    status: string;
    createdAt: string;
    items: Array<{
        id: string;
        name: string;
        price: string;
        quantity: number;
    }>;
    productImage?: string;
    userId: string;
    total: number;
    shippingFee: number;
    deliveryMethod: number;
    payMethod: number;
    address: string;
    phone: string;
}

interface PaymentState {
    currentOrder: any;
    orderHistory: OrderItem[];
    orders: OrderItem[];
    loading: boolean;
    error: string | null;
    paymentSuccess: boolean;
    unreadNotifications: number;
}

const initialState: PaymentState = {
    currentOrder: null,
    orderHistory: [],
    orders: [],
    loading: false,
    error: null,
    paymentSuccess: false,
    unreadNotifications: 0
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setCurrentOrder: (state, action: PayloadAction<any>) => {
            state.currentOrder = action.payload;
        },
        setPaymentSuccess: (state, action: PayloadAction<boolean>) => {
            state.paymentSuccess = action.payload;
        },
        setOrderHistory: (state, action: PayloadAction<any[]>) => {
            state.orderHistory = action.payload;
        },
        setOrders: (state, action: PayloadAction<OrderItem[]>) => {
            state.orders = action.payload;
        },
        resetPaymentState: (state) => {
            state.currentOrder = null;
            state.loading = false;
            state.error = null;
            state.paymentSuccess = false;
        },
        addToOrderHistory: (state, action: PayloadAction<OrderItem>) => {
            state.orders.unshift(action.payload);
            state.unreadNotifications += 1;
        },
        incrementUnreadNotifications: (state) => {
            state.unreadNotifications += 1;
        },
        clearUnreadNotifications: (state) => {
            state.unreadNotifications = 0;
        },
    },
});

export const {
    setLoading,
    setError,
    setCurrentOrder,
    setPaymentSuccess,
    setOrderHistory,
    setOrders,
    resetPaymentState,
    addToOrderHistory,
    incrementUnreadNotifications,
    clearUnreadNotifications,
} = paymentSlice.actions;

export default paymentSlice.reducer; 