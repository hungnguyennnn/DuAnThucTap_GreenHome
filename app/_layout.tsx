import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import TabNavigator from './navigators/TabNavigator';
import Details from './screens/DetailsScreen';
import ListProduct from './screens/ListProductScreen';
import CartScreen from './screens/CartScreen';
import PaymentScreen from './screens/PaymentScreen';
import AfterPayment from './screens/AfterPaymentScreen';
import PaymentSuccess from './screens/PaymentSuccessScreen';
import { PersistGate } from 'redux-persist/integration/react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store/store';
import ChangeInfo from './screens/ChangeInfoScreen';
import QandAScreen from './screens/QandAScreen';
import HandbookListScreen from './screens/HandbookListScreen';
import HandbookDetailScreen from './screens/HandbookDetailScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import notificationService from './utils/NotificationService';
import ManageProductsScreen from './screens/admin/ManageProductsScreen';
import AddProductScreen from './screens/admin/AddProductScreen';
import EditProductScreen from './screens/admin/EditProductScreen';

// Đảm bảo SplashScreen không tự động ẩn
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

const Stack = createStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const [loaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (loaded) {
          // Khởi tạo notification service
          await notificationService.initialize();

          // Thiết lập listeners cho notifications
          notificationListener.current = notificationService.addNotificationReceivedListener(
            notification => {
          
            }
          );

          responseListener.current = notificationService.addNotificationResponseReceivedListener(
            response => {
              const data = response.notification.request.content.data;

            }
          );

          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    }

    prepare();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Tab" component={TabNavigator} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="ListProduct" component={ListProduct} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="AfterPayment" component={AfterPayment} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
          <Stack.Screen name="ChangeInfo" component={ChangeInfo} />
          <Stack.Screen name="QandA" component={QandAScreen} />
          <Stack.Screen name="HandbookList" component={HandbookListScreen} />
          <Stack.Screen name="HandbookDetail" component={HandbookDetailScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen name="ManageProducts" component={ManageProductsScreen} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="EditProduct" component={EditProductScreen} />
        </Stack.Navigator>
      </PersistGate>
    </Provider>
  );
}
