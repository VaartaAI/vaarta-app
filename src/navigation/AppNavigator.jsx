import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import CategoryFeedScreen from '../screens/CategoryFeedScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home:      { active: 'home',     inactive: 'home-outline'     },
  Feed:      { active: 'flash',    inactive: 'flash-outline'    },
  Search:    { active: 'search',   inactive: 'search-outline'   },
  Bookmarks: { active: 'bookmark', inactive: 'bookmark-outline' },
  Profile:   { active: 'person',   inactive: 'person-outline'   },
};

function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => {
          const cfg = TAB_ICONS[route.name];
          return (
            <Icon
              name={focused ? cfg.active : cfg.inactive}
              size={24}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.text1,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,12,0.96)',
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 0,
        },
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="Feed"      component={FeedScreen} />
      <Tab.Screen name="Search"    component={SearchScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, bootstrapping, preferences } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.saffron} />
      </View>
    );
  }

  // Logged-in but preferences haven't loaded yet — keep showing the splash-like loader
  if (user && preferences === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.saffron} />
      </View>
    );
  }

  const needsOnboarding = user && Array.isArray(preferences) && preferences.length === 0;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main"          component={BottomTabs} />
            <Stack.Screen name="StoryDetail"   component={StoryDetailScreen} />
            <Stack.Screen name="CategoryFeed"  component={CategoryFeedScreen} />
            <Stack.Screen name="EditInterests" component={OnboardingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
