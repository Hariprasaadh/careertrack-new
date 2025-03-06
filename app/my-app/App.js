import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from '@env';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screen imports
import Dashboard from './screens/Dashboard';
import BreathingExercise from './screens/BreathingExercise';
import Pomodoro from './screens/Pomodoro';
import Login from './screens/Login';

// Constants
const Stack = createStackNavigator();
const publishableKey = NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'your_publishable_key_here';

// Shared header configuration
const headerConfig = {
  headerStyle: {
    backgroundColor: '#4A6FFF',
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '600',
  },
};

// Main navigation stack for authenticated users
const MainStackScreen = () => (
  <Stack.Navigator initialRouteName="Dashboard">
    <Stack.Screen
      name="Dashboard"
      component={Dashboard}
      options={{
        title: 'Dashboard',
        ...headerConfig,
      }}
    />
    <Stack.Screen
      name="BreathingExercise"
      component={BreathingExercise}
      options={{
        title: 'Breathing Exercise',
        ...headerConfig,
      }}
    />
    <Stack.Screen
      name="Pomodoro"
      component={Pomodoro}
      options={{
        title: 'Pomodoro Timer',
        ...headerConfig,
      }}
    />
    
  </Stack.Navigator>
);

// Auth navigation stack for unauthenticated users
const AuthStackScreen = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
  </Stack.Navigator>
);

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4A6FFF" />
  </View>
);

const App = () => {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Suspense fallback={<LoadingScreen />}>
            <View style={styles.container}>
              <SignedIn>
                <MainStackScreen />
              </SignedIn>
              <SignedOut>
                <AuthStackScreen />
              </SignedOut>
            </View>
          </Suspense>
        </NavigationContainer>
      </SafeAreaProvider>
    </ClerkProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Added default background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});

export default App;