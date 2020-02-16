import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Header, Card, SearchBar } from 'react-native-elements';
import Theme from "../../constants/Theme.js";
import User from '../../entities/User.js';
import AuthStore from '../../store/AuthStore';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { MaterialIndicator } from 'react-native-indicators';
import UserProfile from '../../components/UserProfile';

const pageTitle = "Dashboard";

@observer
export default class Dashboard extends React.Component {

  @observable
  appUser: User;

  componentDidMount() {
    AuthStore.getUser().then((user) => {
      this.appUser = user;
    });
  }

  navigateSettings = () => {
    console.log('nav settings')
    this.props.navigation.navigate('Settings');
  }

  render () {
      return (
        <View>
            <Header
              placement="left"
              centerComponent={{ text: pageTitle, style: { color: '#fff' } }}
              rightComponent={{ icon: 'dashboard', color: '#fff' }}
            />
            
            {/*<SearchBar/>*/}

            <View style={styles.container}>
                <View style={{ height: 80 }}>
                    <Card>
                      <View>
                        {this.appUser?<UserProfile user={this.appUser} settingsButton={this.navigateSettings}/>:<View><MaterialIndicator/></View>}
                      </View>
                    </Card>
                </View>
                {/*<View>
                    <Card title="Notifications">
                      <View>
                      </View>
                    </Card>
                </View>*/}
            </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Theme.colors.default.background,
  },
  buttonPad: {
    padding: 2,
  },
  fullWidthCard: {
    flex: 1,
    padding: 10,
    height: 10,
  }
});
