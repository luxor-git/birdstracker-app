import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';
import Theme from "../../constants/Theme.js";
import { LinearGradient } from 'expo-linear-gradient';
//import Carousel, { Pagination } from 'react-native-snap-carousel';

const {height, width} = Dimensions.get('window');

export default class Welcome extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient start={{x: 1, y: 0.25}} end={{x: 0, y: 0.75}} colors={['#91C040', '#568f3d']} style={{flex: 1}}>
          <View style={styles.onboardingWrapper}>
            {/*<Image source={require('../../assets/images/logo.png')}/>*/}
          </View>

          <View style={styles.loginWrapper}>
            <View style={styles.buttonPad}>
              <Button title="Log in" onPress={() => this.props.navigation.navigate('Login') }/>
            </View>

            <View style={styles.buttonPad}>
              <Button title="Sign up" onPress={() => this.props.navigation.navigate('Register') }/>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  buttonPad: {
    padding: 2,
    marginBottom: 5
  },
  onboardingWrapper: {
    width: width,
    height: (height / 3) * 2
  },
  loginWrapper: {
    alignSelf: 'stretch',
    height: height / 3,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    backgroundColor: '#fff'
  }
});
