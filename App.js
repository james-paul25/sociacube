import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
// This is the main entry point of the application.
// It sets up the navigation structure using React Navigation.
// The app starts with the Login screen, and users can navigate to Home or Create Account screens.
// The header is hidden for a cleaner look, and the app uses a stack navigator to manage screen transitions.
// The Home screen displays user information after a successful login, while the Create Account screen allows new users to register.
// The app uses Firebase for user authentication and data storage, with bcrypt for password hashing.
// The NavigationContainer wraps the entire app to manage navigation state and linking.