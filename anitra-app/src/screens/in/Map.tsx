import React from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import Theme from "../../constants/Theme.js";
import MapView from 'react-native-maps';
import { Header } from 'react-native-elements';
import { UrlTile, Marker, LatLng } from 'react-native-maps';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import TrackingStore from "../../store/TrackingStore";
import { Tracking } from '../../entities/Tracking.js';

const pageTitle = "Map";

@observer
export default class Map extends React.Component {

  @observable
  tileUrl : string = 'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png';

  @observable
  trackings: Tracking[] = [];

  @observable
  loading: boolean = false;

  async componentDidMount () {
      this.loading = true;
      this.trackings = await (await TrackingStore.getTrackingList(true)).data;
      this.loading = false;
  }

  render () {
      return (
        <View style={styles.container}>
            <Header
                placement="left"
                centerComponent={{ text: pageTitle, style: { color: '#fff' } }}
                rightComponent={{ icon: 'map', type: 'font-awesome', color: '#fff' }}
            />
            <View>

                <MapView style={styles.mapStyle}>
                    <UrlTile urlTemplate={this.tileUrl} zIndex={1} />
                    {this.trackings.filter(tracking => {
                      console.log(JSON.stringify(tracking.lastPosition));
                      if (tracking.lastPosition) {
                          console.log(tracking);
                          return tracking.lastPosition.lat && tracking.lastPosition.lng;
                      }
                      return false;
                    }).map(tracking => (
                        
                        <Marker
                          coordinate={ { latitude: tracking.lastPosition.lat, longitude: tracking.lastPosition.lng } }
                          title={tracking.getName()}
                          description={tracking.note}
                        />
                    ))}
                </MapView>
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
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 30,
  }
});
