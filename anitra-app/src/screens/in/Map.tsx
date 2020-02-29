import React from 'react';
import { StyleSheet, Text, View, Dimensions, Picker, TextInput } from 'react-native';
import Theme from "../../constants/Theme.js";
import MapView from 'react-native-maps';
import { SearchBar, Button, Icon } from 'react-native-elements';
import { UrlTile, Marker, LatLng } from 'react-native-maps';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import LoadingOverlay from '../../components/LoadingOverlay';
import LayersOverlay from '../../components/LayersOverlay';
import TrackingStore from "../../store/TrackingStore";
import { Tracking } from '../../entities/Tracking.js';
import SlidingUpPanel from 'rn-sliding-up-panel';
import OverlayStore from "../../store/OverlayStore";
import Layer from '../../entities/Layer.js';

const {height} = Dimensions.get('window');

const pageTitle = "Map";

@observer
export default class Map extends React.Component {

  //@observable
  //tileUrl : string = 'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png';

  @observable
  layer: Layer = null;

  @observable
  trackings: Tracking[] = [];

  @observable
  loading: boolean = false;

  @observable
  showLayersOverlay: boolean = false;

  @observable
  loadingText: string = "Loading";

  draggedValue: number;

  private panel;

  async componentDidMount () {
      this.loading = true;
      this.loadingText = "Loading trackings";
      this.trackings = await (await TrackingStore.getTrackingList(true)).data;

      this.trackings.forEach((x) => {
        console.log(x.lastPosition);
      });

      this.loadingText = "Loading map";
      this.layer = await OverlayStore.getDefaultLayer();
      this.loading = false;
  }

  async selectLayer (layer: Layer) {
    this.layer = layer;
    this.showLayersOverlay = false;
  }

  render () {
      return (
        <View style={styles.container}>
            {this.loading && <LoadingOverlay loadingText={this.loadingText}/>}
            {this.showLayersOverlay && <LayersOverlay selectedLayer={this.layer} setLayer={this.selectLayer.bind(this)} />}
            <MapView style={styles.mapStyle} rotateEnabled={false} mapType="none">
                {this.layer && <UrlTile urlTemplate={this.layer.getTileUrl()} zIndex={1} />}
                    {/*this.trackings.filter(tracking => {
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
                    ))*/}
            </MapView>
            <SlidingUpPanel
              ref={c => (this.panel = c)}
              draggableRange={{top: height / 1.75, bottom: 40}}
              animatedValue={this.draggedValue}
              showBackdrop={false}
              containerStyle={{ backgroundColor: "transparent" }}
            >
              <View style={styles.panel}>
                <View style={styles.panelHeader}>
                    <View style={{ height: 2, backgroundColor: "#fff", width: 60}}>
                    </View>
                </View>
                <View style={styles.container}>
                  <View style={styles.inputWrapper}>
                      <SearchBar
                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, borderColor: "#fff", borderTopColor: "transparent", borderBottomColor: "transparent" }}
                        inputContainerStyle={{ backgroundColor: "#fff", borderWidth: 0, borderColor: "#fff", borderRadius: 0 }}
                        inputStyle={{ color: "#000" }}
                      />
                  </View>

                  <View style={styles.inputWrapperOffset}>
                    <Text style={{marginBottom: 5}}>
                      Species
                    </Text>
                    <Picker
                        style={{height: 40, width: "auto", backgroundColor: "#fff" }}
                        onValueChange={(itemValue, itemIndex) => {}}
                        
                    >
                      <Picker.Item label="birb" value="birb" />
                    </Picker>
                  </View>

                  <View style={styles.inputWrapperOffset}>
                    <View style={{ display: "flex", flexDirection: "row" }}>
                      <View style={{ flexGrow: 1 }}>
                        <Text style={styles.inputLabel}>
                          From
                        </Text>

                        <TextInput
                          style={styles.textInput}
                          keyboardType={'numeric'}
                        />
                      </View>

                      <View style={{ width: 15 }}>

                      </View>

                      <View style={{ flexGrow: 1 }}>
                        <Text style={styles.inputLabel}>
                          To
                        </Text>

                        <TextInput
                          style={styles.textInput}
                          keyboardType={'numeric'}
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <Icon
                      raised
                      name='map'
                      type='font-awesome'
                      color='#f50'
                      onPress={() => { this.showLayersOverlay = true }}
                    />
                  </View>
                </View>
              </View>
            </SlidingUpPanel>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.brand.primary
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
    height: Dimensions.get('window').height,
  },
  buttonControl: {
    borderRadius: 100,
    backgroundColor: "red"
  },
  panel: {
    flex: 1,
    position: 'relative'
  },
  textInput: {
    height: 40,
    backgroundColor: "#fff",
    color: "#000"
  },
  panelHeader: {
    height: 40,
    backgroundColor: Theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderColor: "transparent"
  },
  inputWrapper: {
    padding: 5,
    borderWidth: 0
  },
  inputWrapperOffset: {
    padding: 5,
    paddingLeft: 12,
    paddingRight: 12,
    borderWidth: 0
  },
  inputLabel: {
    marginBottom: 5
  }
});
