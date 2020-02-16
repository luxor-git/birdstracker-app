import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Header, Card, SearchBar } from 'react-native-elements';
import Theme from "../../constants/Theme.js";

const pageTitle = "Dashboard";

export default class Dashboard extends React.Component {

  render () {
      return (
        <View>
            <Header
              placement="left"
              centerComponent={{ text: pageTitle, style: { color: '#fff' } }}
              rightComponent={{ icon: 'dashboard', color: '#fff' }}
            />
            
            <SearchBar/>

            <View style={styles.container}>
                <View style={{ height: 300 }}>
                    <Card title="Notifications" containerStyle={{flex: 1}}>
                      <View>
                      </View>
                    </Card>
                </View>
            </View>
        </View>
      );
  }
}

/*
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
