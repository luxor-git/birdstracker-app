import React from 'react';
import { StyleSheet, Text, View, Alert, Dimensions } from 'react-native';
import Theme from "../../constants/Theme.js";
import TrackingStore from "../../store/TrackingStore";
import { Tracking } from '../../entities/Tracking.js';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIndicator } from 'react-native-indicators';

@observer
export default class TrackingDetail extends React.Component {

  @observable
  trackingDetail: Tracking;

  @observable
  loaded: boolean = false;

  @observable
  title: string = "";

  @observable
  id: number = 1983;

  @observable
  title: string = "Loading...";

  async componentDidMount() {
      this.loaded = false;

      let errorFn = () => {
        Alert.alert('Tracking does not exist');
        this.props.navigation.navigate('Trackings');
      };

      if (this.props.state || this.id) {
        let id = this.id;

        if (this.props.state) {
            id = this.props.state.id;
        }
        
        if (id) {
            console.log(this.id);
            let result = await TrackingStore.getTracking(id, false);
            console.log(result);

            if (result.success) {
                this.trackingDetail = result.data;
                this.loaded = true;
                this.id = id;
                this.title = this.trackingDetail.getName();
            } else {
                errorFn();
            }
        }
    } else {
        errorFn();
    }
  }

  render () { 
      return (
        <View style={styles.container}>
          <Header
            placement="left"
            backgroundColor={ Theme.colors.default.header }
            centerComponent={{ text: this.title, style: { color: '#fff' } }}
            rightComponent={{ icon: 'paw', type: 'font-awesome', color: '#fff' }}
          />
        
          {(!this.loaded)?
            (<View style={styles.loadingContainer}>
                <MaterialIndicator/>
            </View>):(
            <View style={styles.trackingContainer}>
                <View>
                    
                </View>
                <Text>It loaded, wow!</Text>
            </View>
            )
          }

        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.default.background,
  },
  loadingContainer: {
      flex: 1
  },
  trackingContainer: {
      flex: 1,
      padding: 2,
      margin: 10,
      backgroundColor: Theme.colors.default.light
  }
});