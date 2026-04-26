import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import { colors } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Feed:      { active: 'home',          inactive: 'home-outline'          },
  Search:    { active: 'search',        inactive: 'search-outline'        },
  Bookmarks: { active: 'bookmark',      inactive: 'bookmark-outline'      },
  Profile:   { active: 'person',        inactive: 'person-outline'        },
};

function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
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
      <Tab.Screen name="Feed"      component={FeedScreen} />
      <Tab.Screen name="Search"    component={SearchScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Main"        component={BottomTabs} />
        <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
