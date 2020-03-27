import React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView , Image, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Theme from "../../constants/Theme.js";
import AuthStore from "../../store/AuthStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { LinearGradient } from 'expo-linear-gradient';
const {height, width} = Dimensions.get('window');
import { showMessage, hideMessage } from "react-native-flash-message";

@observer
export default class Login extends React.Component {

  @observable
  email: string = "";
  @observable
  password: string = "";

  @observable
  isLoading: boolean = false;

  authenticate = async () => {
    this.isLoading = true;
    Keyboard.dismiss();
    const reply = await AuthStore.authenticate(this.email, this.password);
    console.log(reply);
    if (reply.success) {
      this.props.navigation.navigate('Map');
    } else {
      showMessage({
        message: "Authentication error",
        type: "danger",
        icon: 'danger'
      });
    }

    this.isLoading = false;
  }

  componentDidMount = async () => {
    let credentials = await AuthStore.getStoredCredentials();
    if (credentials) {
      this.email = credentials.userName;
      this.password = credentials.password;
    }
  }

  render () {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{flex: 1, height: height, width: width}}>
            <LinearGradient start={{x: 1, y: 0.25}} end={{x: 0, y: 0.75}} colors={['#91C040', '#568f3d']} style={{flex: 1}}>
              <View style={styles.loginWrapper}>
                <View style={styles.wrapperRow}>
                  <Input
                    value={this.email}
                    onChangeText={ (text) => { this.email = text; } }
                    placeholder='E-mail'
                  />
                </View>

                <View style={styles.wrapperRow}>
                  <Input 
                    style={styles.input}
                    value={this.password}
                    onChangeText={ (text) => { this.password = text; } }
                    secureTextEntry={true}
                    placeholder="Password"
                  />
                </View>

                <View style={styles.wrapperRow}>
                  <Button 
                    title="Login"
                    onPress={ this.authenticate }
                    disabled={ this.isLoading }
                    icon={
                      <Icon
                        name="user"
                        size={15}
                        color="white"
                        style={{ marginRight: 5 }}
                      />
                    }
                    buttonStyle={{ backgroundColor: Theme.colors.brand.primary }}
                    loading={ this.isLoading }
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.default.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginWrapper: {
    margin: 30,
    backgroundColor: Theme.colors.default.light,
    padding: 15,
    borderRadius: 10,
    marginTop: height / 3
  },
  wrapperRow: {
    marginBottom: 15
  },
  input: {
    borderBottomColor: Theme.colors.brand.primary,
    padding: 1,
    flex: 1,
    marginBottom: 10
  }
});
