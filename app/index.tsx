// Index.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react-native';
import { RecoilRoot } from 'recoil';
import AccountScreen from '../components/bottomNavScreens/AccountScreen';
import CartScreen from '../components/bottomNavScreens/CartScreen';
import HomeScreen from '../components/bottomNavScreens/HomeScreen';
import ProductsScreen from '../components/bottomNavScreens/ProductsScreen';

const Tab = createBottomTabNavigator();

export default function Index() {
  return (
    <RecoilRoot>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb'
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#6b7280',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Home className="w-6 h-6" color={color} />
            ),
            tabBarLabelStyle: { paddingBottom: 4 }
          }}
        />
        <Tab.Screen 
          name="Products" 
          component={ProductsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <ShoppingBag className="w-6 h-6" color={color} />
            ),
            tabBarLabelStyle: { paddingBottom: 4 }
          }}
        />
        <Tab.Screen 
          name="Account" 
          component={AccountScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <User className="w-6 h-6" color={color} />
            ),
            tabBarLabelStyle: { paddingBottom: 4 }
          }}
        />
        <Tab.Screen 
          name="Cart" 
          component={CartScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <ShoppingCart className="w-6 h-6" color={color} />
            ),
            tabBarLabelStyle: { paddingBottom: 4 }
          }}
        />
      </Tab.Navigator>
    </RecoilRoot>
  );
}