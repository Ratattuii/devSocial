// src/AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import AuthContext from './context/AuthContext';
import AuthStack from './screens/AuthStack';
import HomeScreen from './screens/HomeScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import LoadingSpinner from './components/LoadingSpinner';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  console.log('AppNavigator: userToken =', userToken, 'isLoading =', isLoading);

  if (isLoading) {
    return <LoadingSpinner message="Carregando aplicativo..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;