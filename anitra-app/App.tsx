import 'react-native-gesture-handler';
import React from 'react';
import { createSwitchNavigator, createAppContainer, NavigationContainerComponent, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { addInvalidTokenListener } from './src/common/ApiUtils';

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import BackgroundSync from './src/common/BackgroundSync';
import { TASK_NAMES } from './src/common/BackgroundSync';

import AuthStore from './src/store/AuthStore';
import Storage from './src/common/Storage';

import AuthLoading from './src/screens/AuthLoading';

import Welcome from './src/screens/auth/Welcome';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';

import MapScreen from './src/screens/in/Map';

import { Alert } from 'react-native';
import FlashMessage from "react-native-flash-message";

TaskManager.defineTask(TASK_NAMES.TASK_UPDATE_TRACKINGS, async () => {
  await BackgroundSync.syncTrackings();
});

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
      <React.Fragment>
        <AppContainer ref = { setNavigatorRef }/>
        <FlashMessage position="top" />
      </React.Fragment>
    )
  }
}

addInvalidTokenListener(async () => {
  await AuthStore.logout();
  Alert.alert("User credentials expired, please sign in again.");
  navigate("AuthLoading", {});
});

BackgroundFetch.registerTaskAsync(
  TASK_NAMES.TASK_UPDATE_TRACKINGS,
  {
      minimumInterval: 10
  }
);