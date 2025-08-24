import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from './src/components/SplashScreen';

// Import screens
import RegisterScreen from './src/screens/RegisterScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import FeedingScreen from './src/screens/FeedingScreen';
import StatsScreen from './src/screens/StatsScreen';
import AboutScreen from './src/screens/AboutScreen';

// Create tab navigator
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Sobre" component={AboutScreen} />
    </HomeStack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

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
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Cadastro" component={RegisterScreen} />
        <Tab.Screen name="Alimentação" component={FeedingScreen} />
        <Tab.Screen name="Estatísticas" component={StatsScreen} />
        <Tab.Screen name="Histórico" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
