import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from '@env';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons

// Screen imports
import Dashboard from './screens/Dashboard';
import BreathingExercise from './screens/BreathingExercise';
import Pomodoro from './screens/Pomodoro';
import Login from './screens/Login';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const publishableKey = NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'your_publishable_key_here';

const headerConfig = {
  headerStyle: {
    backgroundColor: '#4A6FFF',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '600',
  },
};

// Main stack with bottom tabs
const MainStackScreen = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = 'view-dashboard';
        else if (route.name === 'Breathing') iconName = 'meditation';
        else if (route.name === 'Pomodoro') iconName = 'timer-sand';

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4A6FFF',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#fff' },
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} options={{ ...headerConfig }}/>
    <Tab.Screen name="Breathing" component={BreathingExercise} options={{ ...headerConfig }}/>
    <Tab.Screen name="Pomodoro" component={Pomodoro} options={{ ...headerConfig }}/>
  </Tab.Navigator>
);

// Authentication stack
const AuthStackScreen = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
  </Stack.Navigator>
);

// Loading screen
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});

export default App;
