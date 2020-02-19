import React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView , Image} from 'react-native';
import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Theme from "../../constants/Theme.js";
import AuthStore from "../../store/AuthStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';

// todo prefill e-mail from preferences if available

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
    const reply = await AuthStore.authenticate(this.email, this.password);
    console.log(reply);
    if (reply.success) {
      this.props.navigation.navigate('Dashboard');
    } else {
      reply.messages.forEach(x => {
        console.log(x);
        //Toast.show(x);
      });
    }

    this.isLoading = false;
  }

  componentDidMount = async () => {
    let credentials = await AuthStore.getStoredCredentials();

    if (credentials) {
      this.email = credentials.email;
      this.password = credentials.password;
    }
  }

  render () {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>

        <Image source={require('../../assets/images/logo.png')}></Image>

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
              loading={ this.isLoading }
            />
          </View>

        </View>

        {/*<View>
          <Button 
            title="Sign with Google"
            onPress={() => this.authenticate}
          />
        </View>*/}
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
    alignSelf: 'stretch',
    margin: 30,
    backgroundColor: Theme.colors.default.light,
    padding: 15,
    borderRadius: 10
  },
  wrapperRow: {
    marginBottom: 15
  },
  input: {
    borderBottomColor: Theme.colors.brand.secondary,
    padding: 1,
    flex: 1,
    marginBottom: 10
  }
});
