import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecoilRoot } from "recoil";
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <RecoilRoot>
        <SafeAreaProvider>
          <PaperProvider>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: true,
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  title: "Login",
                }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{
                  title: "Sign Up",
                }}
              />
            </Stack.Navigator>
          </PaperProvider>
        </SafeAreaProvider>
      </RecoilRoot>
    </NavigationContainer>
  );
};

export default App;
