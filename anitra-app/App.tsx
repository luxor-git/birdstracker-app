import 'react-native-gesture-handler';
import React from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';

import AuthLoading from './src/screens/AuthLoading';

import Welcome from './src/screens/auth/Welcome';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';

import Dashboard from './src/screens/in/Dashboard';
import MapScreen from './src/screens/in/Map';
import Devices from './src/screens/in/Devices';
import Trackings from './src/screens/in/Trackings';
import Settings from './src/screens/in/Settings';

// container for logged-in users
const LoggedContainer = createDrawerNavigator({
  Dashboard: Dashboard,
  Map: MapScreen,
  Devices: Devices,
  Trackings: Trackings,
  Settings: Settings
});

// authentication flow container
const AuthContainer = createStackNavigator({
  Welcome: Welcome,
  Login: Login,
  Register: Register
});

// default application container
const AppContainer = createSwitchNavigator({
  AuthLoading: AuthLoading,
  LoggedContainer: LoggedContainer,
  AuthContainer: AuthContainer
}, {
  "initialRouteName": "AuthLoading"
});

export default createAppContainer(
  AppContainer
);