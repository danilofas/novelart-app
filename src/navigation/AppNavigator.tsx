import React, {useEffect, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {RootStackParamList, BottomTabParamList} from '../types';
import notificationService from '../services/notifications';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NovelDetailScreen from '../screens/main/NovelDetailScreen';
import ChapterReaderScreen from '../screens/main/ChapterReaderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const HomeIcon = () => <Text style={styles.icon}>🏠</Text>;
const SearchIcon = () => <Text style={styles.icon}>🔍</Text>;
const LibraryIcon = () => <Text style={styles.icon}>📚</Text>;
const ProfileIcon = () => <Text style={styles.icon}>👤</Text>;

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
});

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6c5ce7',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: SearchIcon,
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Biblioteca',
          tabBarIcon: LibraryIcon,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // Set up notification navigation callback when navigation is ready
    notificationService.setNavigationCallback((screen, params) => {
      if (navigationRef.current?.isReady()) {
        // Type-safe navigation with params
        navigationRef.current.navigate(screen as keyof RootStackParamList, params as never);
      }
    });
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {/* Main Tab Navigator - Always accessible */}
        <Stack.Screen name="Main" component={TabNavigator} />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Content Screens */}
        <Stack.Screen
          name="NovelDetail"
          component={NovelDetailScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ChapterReader"
          component={ChapterReaderScreen}
          options={{
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
