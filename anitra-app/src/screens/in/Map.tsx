import React from 'react';
import { StyleSheet, Text, View, Dimensions, Alert, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import Theme from "../../constants/Theme.js";
import MapView, { Callout } from 'react-native-maps';
import { SearchBar, Button, Icon } from 'react-native-elements';
import { UrlTile, Marker, Polyline } from 'react-native-maps';
import { observable, ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import { ScreenOrientation } from 'expo';
import LoadingOverlay from '../../components/LoadingOverlay';
import LayersOverlay from '../../components/LayersOverlay';
import TrackingOverlay from '../../components/TrackingOverlay';
import ContextMenu from '../../components/ContextMenu';
import TrackingStore from "../../store/TrackingStore";
import { Tracking, Species, Track } from '../../entities/Tracking.js';
import SlidingUpPanel from 'rn-sliding-up-panel';
import OverlayStore from "../../store/OverlayStore";
import Layer from '../../entities/Layer.js';
import RNPickerSelect from 'react-native-picker-select';
import ActionButton from 'react-native-circular-action-menu';
import ContextMenuActions from '../../common/ContextMenuActions';
import AuthStore from "../../store/AuthStore";
import TrackingList, { TrackingListActions } from '../../components/TrackingList';
import TrackingDataSlider from '../../components/TrackingDataSlider';

const {height, width} = Dimensions.get('window');

@observer
export default class Map extends React.Component {

  @observable
  layer: Layer = null;

  @observable
  trackings: Tracking[] = [];

  @observable
  mapTrackings: Tracking[] = [];

  @observable
  loadedTrackingTracks: Track[] = [];

  @observable
  loading: boolean = false;

  @observable
  showLayersOverlay: boolean = false;

  @observable
  showTrackingOverlay: boolean = false;

  @observable
  showTrackingDataSlider: boolean = false;

  @observable
  trackingOverlayTracking: Tracking;

  @observable
  loadingText: string = "Loading";

  @observable
  searchText: string = "";

  @observable
  searchSpeciesId: number = null;

  @observable
  species: Species[] = [];

  @observable
  selectSpecies: any[] = [];

  @observable
  contextMenuVisible: boolean = false;

  @observable
  isOrientationLandscape: boolean = false;

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
      this.trackings = await (await TrackingStore.getTrackingList()).data;

      await this.loadMapMarkers();

      this.loadingText = "Loading map";
      this.layer = await OverlayStore.getDefaultLayer();

      this.loadingText = "Loading species";
      this.species = await (await (TrackingStore.getSpecies())).data;

      this.selectSpecies = this.species.map((x) => {
        return {
          label: x.scientificName,
          value: x.id
        }
      });

      this.isOrientationLandscape = (await ScreenOrientation.getOrientationAsync()).orientation.startsWith('LANDSCAPE');
      
      ScreenOrientation.addOrientationChangeListener((orientation) => {
        console.log(orientation);
        if (orientation) {
          if (orientation.orientationInfo) {
            this.isOrientationLandscape = orientation.orientationInfo.orientation.startsWith('LANDSCAPE');
            console.log('Is landscape:', this.isOrientationLandscape);
          }
        }
      });

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
    
    if (searchText || this.searchSpeciesId !== null) {
      console.log('Search not empty');
      for (let i = 0; i < this.trackings.length; i++) {
        if (this.trackings[i].lastPosition) {
          if (this.trackings[i].species && this.searchSpeciesId) {
            if (this.trackings[i].species.id != this.searchSpeciesId) {
              continue;
            }
          }

          if (searchText) {
            let lcName = this.trackings[i].getName().toLowerCase();
            if (lcName.indexOf(searchText) === -1) {
              continue;
            }
          }

          deduplicationMap[this.trackings[i].id] = this.trackings[i];
        }
      }
  
      this.mapTrackings = Object.values(deduplicationMap);
    } else {
      await this.showAllMarkers();
    }
  }

  async reloadSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(async () => {
      await this.loadMapMarkers();
    }, 2000);
  }
  
  async updateSearchText(text) {
    this.searchText = text;
    this.reloadSearch();
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
    await this.unselectTracking();
    this.loading = true;
    this.loadingText = "Loading track...";
    let track = await TrackingStore.getTrack(tracking.id, 100);
    this.loadedTrackingTracks.push(track);
    tracking.trackLoaded = true;
    this.loading = false;
  }

  async unloadTrackingTrack(tracking: Tracking)
  {
    console.log(this.loadedTrackingTracks);

    for (let i = 0; i < this.loadedTrackingTracks.length; i++) {
      if (this.loadedTrackingTracks[i]?.id == tracking.id) {
        this.loadedTrackingTracks.splice(i, 1);
        tracking.trackLoaded = false;
        break;
      }
    }

    await this.unselectTracking();
  }

  async forceReloadTrackingTracks() {
    this.loading = true;
    this.loadingText = "Loading trackings";
    try {
      this.trackings = await (await TrackingStore.getTrackingList(true)).data;
    } catch (e) {
      console.log(e);
      this.loading = false;
      return;
    }
    await this.loadMapMarkers();
    this.loading = false;
  }

  async openMenu(mapEvent: any) {
    this.contextMenuVisible = true;
  }

  getContextMenuActions() : ContextMenuActions {
    return {
      closeMenu: async () => {
        this.contextMenuVisible = false;
      },

      signOut: async () => {
        Alert.alert(
          'Sign out',
          'Are you sure you wish to sign out?',
          [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {text: 'OK', onPress: async () => {
              await AuthStore.logout();
              this.props.navigation.navigate('AuthLoading');
            }},
          ],
          {cancelable: false},
        );
      },

      refreshTrackings: async () => {
        this.contextMenuVisible = false;
        this.forceReloadTrackingTracks();
      }
    } as ContextMenuActions;
  }

  getTrackingListActions() : TrackingListActions {
    return {
      refresh: async () => {
        await this.forceReloadTrackingTracks();
      },
      openDetail: async (tracking : Tracking) => {
        this.trackingOverlayTracking = tracking;
        this.showTrackingOverlay = true;
      }
    } as TrackingListActions;
  }

  render () {
      return (
        <KeyboardAvoidingView behavior="padding" enabled style={styles.container}>
          <View style={[styles.container, this.isOrientationLandscape && styles.containerLandscape]}>
              {this.loading && <LoadingOverlay loadingText={this.loadingText}/>}
              {this.showLayersOverlay && <LayersOverlay selectedLayer={this.layer} setLayer={this.selectLayer.bind(this)} />}
              {this.showTrackingOverlay && 
                <TrackingOverlay
                  selectedTracking={this.trackingOverlayTracking}
                  loadTrackingTrack={this.loadTrackingTrack.bind(this)}
                  unloadTrackingTrack={this.unloadTrackingTrack.bind(this)}
                  close={this.unselectTracking.bind(this)}
                />
              }
              {this.contextMenuVisible && <ContextMenu actions={this.getContextMenuActions()}/>}
              {this.showTrackingDataSlider &&
                <TrackingDataSlider
                  close={() => { this.showTrackingDataSlider = false; }}
                  onSuccess={(value) => { console.log(value); }}
                  maxDaysBack={30}
                />
              }

              <MapView style={[styles.mapStyle, this.isOrientationLandscape && styles.mapStyleLandscape, !this.isOrientationLandscape && styles.mapStyleLandscapePortrait]} rotateEnabled={false} mapType="none" onLongPress={(event) => { console.log(event); this.openMenu(event); }}>
                      {this.loadedTrackingTracks.map(track => {
                        return (
                          <Polyline
                            key={track.id}
                            coordinates={
                              track.getPolyLine()
                            }
                            strokeWidth={5}
                            strokeColor="#f00"
                            zIndex={1}
                          />
                        )
                      })}
                      {this.layer && <UrlTile urlTemplate={this.layer.getTileUrl()} zIndex={-1} />}
                      {this.mapTrackings.map(tracking => {
                        let marker = this.markers[tracking.getIconName()];
                        return (
                          <Marker
                            key={tracking.id}
                            coordinate={ { latitude: tracking.lastPosition.lat, longitude: tracking.lastPosition.lng } }
                            title={tracking.getName()}
                            description={tracking.note}
                            icon={marker}
                            image={marker}
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

              {this.isOrientationLandscape &&
                <View style={{ height: height, width: width / 3 }}>
                  <TrackingList actions={this.getTrackingListActions()} trackings={this.mapTrackings}/>
                </View>
              }

              <SlidingUpPanel
                ref={c => (this.panel = c)}
                draggableRange={{top: height / 1.75, bottom: 60}}
                animatedValue={this.draggedValue}
                showBackdrop={false}
                containerStyle={{ backgroundColor: "transparent" }}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                  <View style={styles.panel}>
                    <View style={styles.panelHeader}>
                        <View style={{ height: 2, backgroundColor: "#000", width: 60}}>
                        </View>
                    </View>
                    <View style={styles.container}>
                      <View style={styles.inputWrapper}>
                          <SearchBar
                            containerStyle={{ backgroundColor: "transparent", borderWidth: 0, borderColor: "#fff", borderTopColor: "transparent", borderBottomColor: "transparent" }}
                            inputContainerStyle={{ backgroundColor: "#fff", borderWidth: 0, borderColor: "#fff", borderRadius: 0 }}
                            inputStyle={{ color: "#000" }}
                            onChangeText={(text) => { this.updateSearchText(text) }}
                            value={this.searchText}
                          />
                      </View>

                      <View style={styles.inputWrapperOffset}>
                        <Text style={{marginBottom: 5}}>
                          Species
                        </Text>
                        <RNPickerSelect
                          onValueChange={(value) => { this.searchSpeciesId = value; console.log(this.searchSpeciesId); this.reloadSearch(); }}
                          style={{height: 40, width: "auto", backgroundColor: "#fff" }}
                          items={this.selectSpecies}>
                        </RNPickerSelect>
                      </View>

                      {/*<View style={styles.inputWrapperOffset}>
                        <View style={{ display: "flex", flexDirection: "row" }}>
                          <View style={{ flexGrow: 1 }}>
                            <Text style={styles.inputLabel}>
                              From
                            </Text>

                            <TextInput
                              style={styles.textInput}
                              keyboardType={'number-pad'}
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
                              keyboardType={'number-pad'}
                            />
                          </View>
                        </View>
                      </View>*/}

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
                </TouchableWithoutFeedback>
              </SlidingUpPanel>
          </View>
        </KeyboardAvoidingView>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6'
  },
  containerLandscape: {
    flexDirection: "row"
  },
  buttonPad: {
    padding: 2,
  },
  loginWrapper: {
    alignSelf: 'stretch',
    margin: 10
  },
  mapStyle: {
    flex: 1,
    flexGrow: 1
  },
  mapStyleLandscape: {
    width: 2 * (Dimensions.get('window').width / 3),
  },
  mapStyleLandscapePortrait: {
    width: Dimensions.get('window').width,
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
    height: 20,
    backgroundColor: "#fff",
    color: "#000"
  },
  panelHeader: {
    height: 40,
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
