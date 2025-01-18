import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecoilRoot } from 'recoil';
import HomeScreen from '../components/HomeScreen';

const Stack = createNativeStackNavigator();
export default function Index() {
  return (
    <RecoilRoot>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </RecoilRoot>
  );
}
