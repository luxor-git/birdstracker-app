import React from 'react';
import { StyleSheet, Text, View, Dimensions, Picker, TextInput } from 'react-native';
import Theme from "../../constants/Theme.js";
import MapView, { Callout } from 'react-native-maps';
import { SearchBar, Button, Icon } from 'react-native-elements';
import { UrlTile, Marker, LatLng } from 'react-native-maps';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import LoadingOverlay from '../../components/LoadingOverlay';
import LayersOverlay from '../../components/LayersOverlay';
import TrackingOverlay from '../../components/TrackingOverlay';
import TrackingStore from "../../store/TrackingStore";
import { Tracking } from '../../entities/Tracking.js';
import SlidingUpPanel from 'rn-sliding-up-panel';
import OverlayStore from "../../store/OverlayStore";
import Layer from '../../entities/Layer.js';
import ActionButton from 'react-native-circular-action-menu';

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
  mapTrackings: Tracking[] = [];

  @observable
  loading: boolean = false;

  @observable
  showLayersOverlay: boolean = false;

  @observable
  showTrackingOverlay: boolean = false;

  @observable
  trackingOverlayTracking: Tracking;

  @observable
  loadingText: string = "Loading";

  @observable
  searchText: string = "";

  private searchTimeout;

  private draggedValue: number;

  private panel;

  public markers = {
    marker24h: require('../../assets/markers/marker24h.png'),
    marker7d: require('../../assets/markers/marker7d.png'),
    marker30d: require('../../assets/markers/marker30d.png'),
    markerElse: require('../../assets/markers/markerElse.png'),
  };

  async componentDidMount () {
      this.loading = true;
      this.loadingText = "Loading trackings";
      this.trackings = await (await TrackingStore.getTrackingList(true)).data;

      await this.loadMapMarkers();

      this.loadingText = "Loading map";
      this.layer = await OverlayStore.getDefaultLayer();
      this.loading = false;
  }

  async showAllMarkers() {
    let deduplicationMap = {}; // deduplication map

    for (let i = 0; i < this.trackings.length; i++) {
      if (this.trackings[i].lastPosition) {
        deduplicationMap[this.trackings[i].id] = this.trackings[i];
      }
    }

    this.mapTrackings = Object.values(deduplicationMap);
  }

  async loadMapMarkers() {
    console.log('reloading search');
    console.log('Search text', this.searchText);
    let searchText = this.searchText.toLowerCase();
    let deduplicationMap = {};
    
    if (searchText) {
      for (let i = 0; i < this.trackings.length; i++) {
        if (this.trackings[i].lastPosition) {
          if (searchText) {
            let lcName = this.trackings[i].getName().toLowerCase();
            if (lcName.indexOf(searchText) >= 0) {
              deduplicationMap[this.trackings[i].id] = this.trackings[i];
            }
          }
        }
      }
  
      this.mapTrackings = Object.values(deduplicationMap);
    } else {
      await this.showAllMarkers();
    }
  }
  
  async updateSearch(text) {
    this.searchText = text;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(async () => {
      await this.loadMapMarkers();
    }, 2000);
  }

  async selectLayer (layer: Layer) {
    this.layer = layer;
    this.showLayersOverlay = false;
  }

  async selectTracking (tracking: Tracking) {
    console.log('Selected tracking', tracking);
    // todo launch tracking overview
    this.showTrackingOverlay = true;
    this.trackingOverlayTracking = tracking;
  }

  async unselectTracking() {
    this.showTrackingOverlay = false;
    this.trackingOverlayTracking = null;
  }

  async loadTrackingTrack(tracking: Tracking) {
    console.log("Loading track for:", tracking);
  }

  render () {
      return (
        <View style={styles.container}>
            {this.loading && <LoadingOverlay loadingText={this.loadingText}/>}
            {this.showLayersOverlay && <LayersOverlay selectedLayer={this.layer} setLayer={this.selectLayer.bind(this)} />}
            {this.showTrackingOverlay && <TrackingOverlay selectedTracking={this.trackingOverlayTracking} loadTrackingTrack={this.loadTrackingTrack.bind(this)} close={this.unselectTracking.bind(this)}/>}

            <MapView style={styles.mapStyle} rotateEnabled={false} mapType="none">
                {this.layer && <UrlTile urlTemplate={this.layer.getTileUrl()} zIndex={1} />}
                    {this.mapTrackings.map(tracking => {
                      let marker = this.markers[tracking.getIconName()];
                      return (
                        <Marker
                          key={tracking.id}
                          coordinate={ { latitude: tracking.lastPosition.lat, longitude: tracking.lastPosition.lng } }
                          title={tracking.getName()}
                          description={tracking.note}
                          icon={marker}
                        >
                          <Callout onPress={() => this.selectTracking(tracking)}>
                            <View>
                              <Text>
                                {tracking.getName()}
                              </Text>

                              <Text>
                                {tracking.species?.scientificName}
                                {tracking.sex}
                                {tracking.age}
                              </Text>

                              <Text>
                                Device: {tracking.deviceCode}
                              </Text>
                            </View>
                          </Callout>
                        </Marker>
                    )}
                    )}
            </MapView>
            
            
            {/*<ActionButton buttonColor="rgba(231,76,60,1)" position="right">
              <ActionButton.Item buttonColor='#9b59b6' title="New Task" onPress={() => console.log("notes tapped!")}>
                <Icon
                    name='map'
                    type='font-awesome'
                    color='#f50'
                />
              </ActionButton.Item>
              <ActionButton.Item buttonColor='#3498db' title="Notifications" onPress={() => {}}>
                <Icon
                  name='map'
                  type='font-awesome'
                  color='#f50'
                />
              </ActionButton.Item>
              <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => {}}>
                <Icon
                  name='map'
                  type='font-awesome'
                  color='#f50'
                />
              </ActionButton.Item>
                  </ActionButton>*/}

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
                        onChangeText={(text) => { this.updateSearch(text) }}
                        value={this.searchText}
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
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  }
});
