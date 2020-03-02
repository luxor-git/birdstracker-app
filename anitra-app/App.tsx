import 'react-native-gesture-handler';
import React from 'react';
import { createSwitchNavigator, createAppContainer, NavigationContainerComponent, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { addInvalidTokenListener } from './src/common/ApiUtils';
import AuthStore from './src/store/AuthStore';
import Storage from './src/common/Storage';

import AuthLoading from './src/screens/AuthLoading';

import Welcome from './src/screens/auth/Welcome';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';

import Dashboard from './src/screens/in/Dashboard';
import MapScreen from './src/screens/in/Map';
import Devices from './src/screens/in/Devices';
import Trackings from './src/screens/in/Trackings';
import TrackingDetail from './src/screens/in/TrackingDetail';
import Settings from './src/screens/in/Settings';
import { Alert } from 'react-native';

// authentication flow container
const AuthContainer = createStackNavigator({
  Welcome: Welcome,
  Login: Login,
  Register: Register
}, {
  headerMode: 'none'
});

// default application container
const AppNavigator = createSwitchNavigator({
  AuthLoading: AuthLoading,
  Map: MapScreen,
  AuthContainer: AuthContainer
}, {
  "initialRouteName": "AuthLoading"
});

let instanceRef: NavigationContainerComponent;

function setNavigatorRef(instance: NavigationContainerComponent) {
  instanceRef = instance;
}
// todo move this to own class
function navigate(routeName, params) {
  instanceRef.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

const AppContainer = createAppContainer(
  AppNavigator
);

Storage.init();

export default class App extends React.Component
{
  render () {
    return (
      <AppContainer ref = { setNavigatorRef }/>
    )
  }
}

addInvalidTokenListener(async () => {
  await AuthStore.logout();
  Alert.alert("User credentials expired, please sign in again.");
  navigate("AuthLoading", {});
});