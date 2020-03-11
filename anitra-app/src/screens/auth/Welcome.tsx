import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions, SafeAreaView } from 'react-native';
import { Button } from 'react-native-elements';
import Theme from "../../constants/Theme.js";
import { LinearGradient } from 'expo-linear-gradient';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ScreenOrientation } from 'expo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const {height, width} = Dimensions.get('window');

const sliderData = [
  {
    component:  (
        <View style={{ display: "flex",  flex: 1, flexDirection: 'column' }}>
          <Text style={{ textAlign: 'center', alignContent: 'center', color: Theme.colors.brand.secondary, fontSize: 20 }}>
            Welcome to Anitra!
          </Text>

          <View style={{ flexGrow: 1 }}>

          </View>

          <Text style={{ textAlign: 'center', alignSelf: 'baseline' }}>
            Please sign in or sign up below.
          </Text>
        </View>
      )
  },
  {
    component: (
        <View style={{ display: "flex",  flex: 1, flexDirection: 'column' }}>
          <Text style={{ textAlign: 'center', alignContent: 'center', color: Theme.colors.brand.secondary, fontSize: 20 }}>
            Welcome to Anitra!
          </Text>

          <View style={{ flexGrow: 1 }}>

          </View>

          <Text style={{ textAlign: 'center', alignSelf: 'baseline' }}>
            Please sign in or sign up below.
          </Text>
        </View>
      )
  },
];

@observer
export default class Welcome extends React.Component {

  @observable
  activeSlide = 0;

  async componentDidMount() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient start={{x: 1, y: 0.25}} end={{x: 0, y: 0.75}} colors={['#91C040', '#568f3d']} style={{flex: 1}}>
          <View style={styles.onboardingWrapper}>
            {<Image style={{ position: 'absolute' }} source={require('../../assets/images/clouds_left.png')} />}

            <Carousel
              data={sliderData}
              sliderWidth={width}
              itemWidth={width}
              containerCustomStyle={{ flex: 1 }}
              slideStyle={{ flex: 1 }}
              onSnapToItem={(index) => { this.activeSlide = index; } }
              renderItem={
                (item) => {
                  return (
                    <View style={{ flex: 1, borderRadius: 30, padding: 10, backgroundColor: 'rgba(255,255,255,1)', margin: 20, marginTop: 50, alignContent: "center", alignItems: 'center' }}>
                      {item.item.component}
                    </View>
                  )
                }
              }
            />

            <Pagination
              dotsLength={sliderData.length}
              activeDotIndex={this.activeSlide}
              containerStyle={{ backgroundColor: 'transparent' }}
              dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)'
              }}
              inactiveDotStyle={{
                  // Define styles for inactive dots here
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
          </View>

          <SafeAreaView style={styles.loginWrapper}>
            <View style={[styles.buttonPad, styles.buttonTopMargin]}>
              <Button buttonStyle={styles.button} title="Log in" onPress={() => this.props.navigation.navigate('Login') }/>
            </View>

            <View style={styles.buttonPad}>
              <Button buttonStyle={styles.buttonAlt} title="Sign up" onPress={() => this.props.navigation.navigate('Register') }/>
            </View>
          </SafeAreaView>
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
  buttonTopMargin: {
    marginTop: 20
  },
  buttonPad: {
    padding: 2,
    marginBottom: 5,
    marginLeft: wp('5%'),
    marginRight: wp('5%')
  },
  onboardingWrapper: {
    width: width,
    height: (height / 5) * 4
  },
  loginWrapper: {
    alignSelf: 'stretch',
    height: height / 5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: Theme.colors.brand.primary
  },
  buttonAlt: {
    backgroundColor: Theme.colors.brand.secondary
  }
});
