import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ChatScreen from '../screens/Chat';
import { RootState } from '../redux/store/store';

const Tab = createBottomTabNavigator();

const getIconName = (routeName: string, focused: boolean): string => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Search':
      return focused ? 'search' : 'search-outline';
    case 'Notification':
      return focused ? 'notifications' : 'notifications-outline';
    case 'Chat':
      return focused ? 'chatbubble' : 'chatbubble-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'ellipse-outline';
  }
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const currentRoute = state.routes[state.index]?.name;

  if (['Cart', 'Chat', 'Payment', 'PaymentSuccess', 'AfterPayment'].includes(currentRoute)) {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress}>
            <View style={[styles.iconWrapper, isFocused && styles.activeWrapper]}>
              <Ionicons
                name={getIconName(route.name, isFocused)}
                size={24}
                color={isFocused ? '#6B4F35' : '#fff'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  const unreadNotifications = useSelector((state: RootState) => state.payment.unreadNotifications);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'rgba(12, 24, 1, 0.5)',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 30,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
});
