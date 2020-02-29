import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';

import AuthStore from '../store/AuthStore';
import Theme from "../constants/Theme.js";

export default class AuthLoading extends React.Component {
   verifyAuth = async () => {
      await AuthStore.awaitAuth();
      if (AuthStore.isAuthorized) {
        this.props.navigation.navigate("Map");
      } else {
        this.props.navigation.navigate("AuthContainer");
      }
  }

  componentDidMount() {
      this.verifyAuth();
  }

  render () {
      return (
        <View style={styles.container}>
            <View>
                <MaterialIndicator color={ Theme.colors.brand.primary }/>
            </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.default.background,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  }
});
