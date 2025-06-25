import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
          options={{ title: 'Create Account' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
// This is the main entry point of the Sociacube app, which sets up navigation between the Login and Create Account screens.
// The app uses React Navigation to manage the navigation stack, allowing users to navigate between screens seamlessly.
// The LoginScreen and CreateAccountScreen components handle user authentication and account creation, respectively.
// The app is structured to provide a smooth user experience, with options for users to log in or create a new account.
// The initial route is set to the Login screen, and the Create Account screen is accessible from the Login screen.
// The header for the Login screen is hidden to provide a cleaner interface, while the Create Account screen has a title for clarity.
// This setup allows for easy expansion in the future, as additional screens can be added to the navigation stack as needed.
// The app is designed to be user-friendly, with clear prompts for users to enter their credentials or create a new account.
//// The use of React Native components ensures that the app is responsive and works well on both iOS and Android devices.
// The app's structure follows best practices for React Native development, ensuring maintainability and scalability.
// The Sociacube app aims to provide a seamless and secure user experience for managing social interactions and accounts.
// By using Firebase for backend services, the app can efficiently handle user authentication and data storage      