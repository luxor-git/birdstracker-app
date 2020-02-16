import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Button } from 'react-native-elements';
import Theme from "../../constants/Theme.js";

export default class Welcome extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Image source={require('../../assets/images/logo.png')}/>
        </View>

        <View style={styles.loginWrapper}>
          <View style={styles.buttonPad}>
            <Button title="Log in" onPress={() => this.props.navigation.navigate('Login') }/>
          </View>

          <View style={styles.buttonPad}>
            <Button title="Sign up" onPress={() => this.props.navigation.navigate('Register') }/>
          </View>
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
  },
  buttonPad: {
    padding: 2,
    marginBottom: 5
  },
  loginWrapper: {
    alignSelf: 'stretch',
    margin: 10
  }
});
