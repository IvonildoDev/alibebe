import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import RegisterScreen from './src/screens/RegisterScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import FeedingScreen from './src/screens/FeedingScreen';
import StatsScreen from './src/screens/StatsScreen';

// Create tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Cadastro') {
              iconName = focused ? 'person-add' : 'person-add-outline';
            } else if (route.name === 'Alimentação') {
              iconName = focused ? 'nutrition' : 'nutrition-outline';
            } else if (route.name === 'Estatísticas') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'Histórico') {
              iconName = focused ? 'list' : 'list-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
        initialRouteName="Home"
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Cadastro" component={RegisterScreen} />
        <Tab.Screen name="Alimentação" component={FeedingScreen} />
        <Tab.Screen name="Estatísticas" component={StatsScreen} />
        <Tab.Screen name="Histórico" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
