import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from './screens/Dashboard';
import BreathingExercise from './screens/BreathingExercise';
import Pomodoro from './screens/Pomodoro';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen 
          name="Dashboard" 
          component={Dashboard} 
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen 
          name="BreathingExercise" 
          component={BreathingExercise} 
          options={{ title: 'Breathing Exercise' }}
        />
        <Stack.Screen 
          name="Pomodoro" 
          component={Pomodoro} 
          options={{ title: 'Pomodoro Timer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}