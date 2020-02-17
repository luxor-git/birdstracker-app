import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import Theme from "../../constants/Theme.js";
import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import AuthStore from "../../store/AuthStore";

export default class Settings extends React.Component {

  logOut = async () => {
    await AuthStore.logout();
    this.props.navigation.navigate('AuthLoading');
  }

  render () {
      return (
        <View style={styles.container}>
            <View>
                <Text>Devices</Text>
                <Button 
                  title="Log out"
                  onPress={ this.logOut }
                  icon={
                    <Icon
                      name="user"
                      size={15}
                      color="white"
                      style={{ marginRight: 5 }}
                    />
                  }
                />
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
  },
  loginWrapper: {
    alignSelf: 'stretch',
    margin: 10
  }
});
