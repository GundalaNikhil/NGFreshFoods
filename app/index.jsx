import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { RecoilRoot } from 'recoil';
import AccountScreen from '../components/bottomNavScreens/AccountScreen';
import CartScreen from '../components/bottomNavScreens/CartScreen';
import HomeScreen from '../components/bottomNavScreens/HomeScreen';
import ProductsScreen from '../components/bottomNavScreens/ProductsScreen';
import "../global.css";

// Screen dimensions for responsive design
const { height } = Dimensions.get('window');
const isSmallScreen = height < 700;

const Tab = createBottomTabNavigator();

// Custom tab button with Licious-style animation and feedback
const TabButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;
  const scale = useSharedValue(1);
  
  useEffect(() => {
    // Smoother, more subtle animation like Licious
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable 
      onPress={onPress}
      className={`flex-1 items-center justify-center ${
        isSmallScreen ? 'py-1.5' : 'py-2'
      }`}
    >
      <Reanimated.View 
        className={`items-center justify-center`}
        style={animatedStyle}
      >
        {children}
        {/* Licious-style active indicator dot */}
        {focused && (
          <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-red-500" />
        )}
      </Reanimated.View>
    </Pressable>
  );
};

export default function Index() {
  return (
    <RecoilRoot>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          // Licious-style bottom navigation styling
          tabBarStyle: {
            backgroundColor: 'white',
            height: isSmallScreen ? 60 : 65,
            borderTopWidth: 1,
            borderTopColor: '#f1f1f1',
            paddingBottom: isSmallScreen ? 8 : 10,
            paddingTop: 8,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 0, // Removing default shadow
            shadowOpacity: 0, // Removing iOS shadow
          },
          tabBarActiveTintColor: '#d11243', // Licious red color
          tabBarInactiveTintColor: '#4a4a4a',
          tabBarShowLabel: true,
          tabBarButton: (props) => <TabButton {...props} />,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon
                type="material-community"
                name={focused ? "home" : "home-outline"}
                size={isSmallScreen ? 22 : 24}
                color={color}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text 
                className={`text-[11px] mt-0.5 font-medium ${
                  focused ? 'text-[#d11243]' : 'text-gray-600'
                }`}
              >
                Home
              </Text>
            )
          }}
        />
        <Tab.Screen 
          name="Products" 
          component={ProductsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon
                type="material-community"
                name={focused ? "food-drumstick" : "food-drumstick-outline"}
                size={isSmallScreen ? 22 : 24}
                color={color}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text 
                className={`text-[11px] mt-0.5 font-medium ${
                  focused ? 'text-[#d11243]' : 'text-gray-600'
                }`}
              >
                Products
              </Text>
            )
          }}
        />
        <Tab.Screen 
          name="Account" 
          component={AccountScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon
                type="material-community"
                name={focused ? "account" : "account-outline"}
                size={isSmallScreen ? 22 : 24}
                color={color}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text 
                className={`text-[11px] mt-0.5 font-medium ${
                  focused ? 'text-[#d11243]' : 'text-gray-600'
                }`}
              >
                Account
              </Text>
            )
          }}
        />
        <Tab.Screen 
          name="Cart" 
          component={CartScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View className="relative">
                <Icon
                  type="material-community"
                  name={focused ? "cart" : "cart-outline"}
                  size={isSmallScreen ? 22 : 24}
                  color={color}
                />
                {/* Cart badge - uncomment and connect to your cart state */}
                {/* <View className="absolute -top-1 -right-2 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-[10px] text-white font-bold">2</Text>
                </View> */}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text 
                className={`text-[11px] mt-0.5 font-medium ${
                  focused ? 'text-[#d11243]' : 'text-gray-600'
                }`}
              >
                Cart
              </Text>
            )
          }}
        />
      </Tab.Navigator>
    </RecoilRoot>
  );
}