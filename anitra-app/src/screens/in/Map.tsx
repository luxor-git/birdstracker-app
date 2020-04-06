import React from 'react';
import { StyleSheet, Text, View, Dimensions, Alert, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, AppState, SafeAreaView } from 'react-native';
import Theme from "../../constants/Theme.js";
import MapView, { Callout, MapEvent, LatLng, Polygon } from 'react-native-maps';
import { SearchBar, Button, Icon } from 'react-native-elements';
import { UrlTile, Marker, Polyline } from 'react-native-maps';
import { observable, ObservableMap, computed } from 'mobx';
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
import ContextMenuActions from '../../common/ContextMenuActions';
import AuthStore from "../../store/AuthStore";
import TrackingList, { TrackingListActions } from '../../components/TrackingList';
import TrackingDataSlider from '../../components/TrackingDataSlider';
import TrackingMarker from '../../components/TrackingMarker';
import RegionDownload from '../../components/RegionDownload';
import NetStore from '../../store/NetStore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as lor, removeOrientationListener as rol} from 'react-native-responsive-screen';
import { lonDeltaToZoom, BoundingTileDefinition } from '../../common/GeoUtils';
import { showMessage, hideMessage } from "react-native-flash-message";
import { OfflineRegion } from '../../entities/OfflineRegion.js';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MarkerPosition from '../../components/MarkerPosition';
import { MaterialIndicator } from 'react-native-indicators';

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
  showRegionDownload: boolean = false;

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

  @observable
  displayLastPositions: boolean = true;

  @observable
  selectingOfflineRegion: boolean = false;

  @observable
  showTrackingListOverlay: boolean = false;
  
  @observable
  selectingPolygonLeadingPoints: LatLng[] = [];

  @observable
  offlineAreas: OfflineRegion[] = [];

  @observable
  zoomLevel: number = 1;

  @observable
  isOnline: boolean = false;

  @observable
  expandedPointId: number = null;

  regionChangeTimeout : number = null;

  @computed get selectedPolygon() : LatLng[] 
  {
    if (this.selectingPolygonLeadingPoints.length === 2) {
      return [
        { latitude: this.selectingPolygonLeadingPoints[0].latitude, longitude: this.selectingPolygonLeadingPoints[0].longitude },
        { latitude: this.selectingPolygonLeadingPoints[0].latitude, longitude: this.selectingPolygonLeadingPoints[1].longitude },
        { latitude: this.selectingPolygonLeadingPoints[1].latitude, longitude: this.selectingPolygonLeadingPoints[1].longitude },
        { latitude: this.selectingPolygonLeadingPoints[1].latitude, longitude: this.selectingPolygonLeadingPoints[0].longitude }
      ]
    }

    return [];
  }

  private searchTimeout;

  private draggedValue: number;

  private panel;

  public markers = {
    marker24h: require('../../assets/markers/marker24h.png'),
    marker7d: require('../../assets/markers/marker7d.png'),
    marker30d: require('../../assets/markers/marker30d.png'),
    markerElse: require('../../assets/markers/markerElse.png'),
    markerFirst: require('../../assets/markers/markerFirst.png'),
    markerLast: require('../../assets/markers/markerLast.png'),
  };

  async componentDidMount () {
      lor(this); // Listen for orientation changes

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

      AppState.addEventListener('change', (state) => {
        if (state === "active") {
          this.loadMapMarkers();
        }
      });

      this.loadingText = "Loading offline maps";

      this.offlineAreas = await OverlayStore.getOfflineAreas();

      this.loadingText = "Checking online status";

      this.isOnline = NetStore.getOnline();

      NetStore.addConnectionCallback(async (state) => {
        let previousState = this.isOnline;
        this.isOnline = state;
        
        if (previousState === false && this.isOnline) {
          showMessage({
            message: "Online",
            type: "info",
            icon: 'info'
          });
          this.selectLayer(await OverlayStore.getDefaultLayer());
        } else if (previousState === true && !this.isOnline) {
          showMessage({
            message: "Offline",
            type: "warning",
            icon: 'warning'
          });

          this.selectLayer(OverlayStore.getOfflineLayer());
        }

      });

      showMessage({
        message: "Tap the map for a longer period of time to open the context menu.",
        type: "info",
        icon: 'info'
      });

      this.loading = false;
  }

  componentWillUnmount()
  {
    rol(); //Will stop listening to orientation change events
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
    let searchText = this.searchText.toLowerCase();
    let deduplicationMap = {};
    
    if (searchText || this.searchSpeciesId !== null) {
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
    track.tracking = tracking;
    this.loadedTrackingTracks.push(track);
    tracking.trackLoaded = true;
    this.displayLastPositions = false;
    this.loading = false;
  }

  async unloadTrackingTrack(tracking: Tracking)
  {
    for (let i = 0; i < this.loadedTrackingTracks.length; i++) {
      if (this.loadedTrackingTracks[i]?.id == tracking.id) {
        this.loadedTrackingTracks.splice(i, 1);
        tracking.trackLoaded = false;
        break;
      }
    }

    if (this.loadedTrackingTracks.length === 0) {
      this.displayLastPositions = true;
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

  async onMapClick( event : MapEvent ) {
    if (this.selectingOfflineRegion) {
      let coord : LatLng = event.nativeEvent.coordinate;
      this.selectingPolygonLeadingPoints.push(coord);

      if (this.selectingPolygonLeadingPoints.length === 2) {
        setTimeout(() => {
          this.showRegionDownload = true;
        }, 2000);
        return;
      }
    }
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
      },

      showOfflineAreaEdit: async () => {
        if (this.zoomLevel <= 10) {
          showMessage({
            message: "Please zoom in further",
            type: "info",
            icon: 'info'
          });
          this.contextMenuVisible = false;
        } else {
          showMessage({
            message: "Select two points on your screen to download an offline area.",
            type: "info",
            icon: 'info'
          });

          this.selectingOfflineRegion = true;
          this.selectingPolygonLeadingPoints = [];
          this.contextMenuVisible = false;
        }
      },

      unloadTracks: async () => {
        this.loading = true;

        for (let i = 0; i < this.loadedTrackingTracks.length; i++) {
          await this.unloadTrackingTrack(this.loadedTrackingTracks[i].tracking);
        }

        this.contextMenuVisible = false;
        this.loading = false;
      },
      
      showTrackingList: async () => {
        this.contextMenuVisible = false;
        this.showTrackingListOverlay = true;
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
      },
      loadTracking: async (tracking: Tracking) => {
        await this.loadTrackingTrack(tracking);
      },
      unloadTracking: async (tracking: Tracking) => {
        await this.unloadTrackingTrack(tracking);
      },
      close: async () => {
        this.showTrackingListOverlay = false;
      }
    } as TrackingListActions;
  }

  async discardSelectedRange() {
    this.showRegionDownload = false;
    this.selectingPolygonLeadingPoints = [];
    this.selectingOfflineRegion = false;
  }

  async downloadSelectedRange(range: BoundingTileDefinition) {

    this.showRegionDownload = false;

    this.loading = true;

    this.loadingText = 'Downloading...';


    await OverlayStore.downloadRange(range, range.corners, ((progress) => {
      this.loadingText = 'Downloading: ' + progress + ' / ' + range.tileCount;
    }).bind(this));

    this.loading = false;

    this.showRegionDownload = false;
    this.selectingOfflineRegion = false;

    this.selectingPolygonLeadingPoints = [];

    showMessage({
      message: "Offline region downloaded",
      type: "success",
      icon: 'success'
    });

    this.offlineAreas = await OverlayStore.getOfflineAreas();
  }

  render () {
      const styles = StyleSheet.create({
        containerPortrait: {
          height: hp('50%'),
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
          width: wp('75%'),
        },
        mapStyleLandscapePortrait: {
          width: wp('100%'),
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
        container: {
          flex: 1,
          backgroundColor: Theme.colors.brand.primary
        },
        panelHeader: {
          backgroundColor: Theme.colors.brand.primary,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderColor: "transparent",
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
        },
        trackingListView: {
          height: hp('100%'),
          width: wp('33%')
        }
      });

      return (
        <KeyboardAvoidingView behavior="padding" enabled style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, this.isOrientationLandscape && styles.containerLandscape]}>
              {this.loading && <LoadingOverlay loadingText={this.loadingText}/>}
              {this.showLayersOverlay && <LayersOverlay selectedLayer={this.layer} setLayer={this.selectLayer.bind(this)} close={(() => { this.showLayersOverlay = false; }).bind(this)} />}
              {this.showTrackingOverlay && 
                <TrackingOverlay
                  selectedTracking={this.trackingOverlayTracking}
                  loadTrackingTrack={this.loadTrackingTrack.bind(this)}
                  unloadTrackingTrack={this.unloadTrackingTrack.bind(this)}
                  close={this.unselectTracking.bind(this)}
                />
              }
              {this.contextMenuVisible && <ContextMenu actions={this.getContextMenuActions()} hasTracks={this.loadedTrackingTracks.length > 0}/>}
              {this.showTrackingDataSlider &&
                <TrackingDataSlider
                  close={() => { this.showTrackingDataSlider = false; }}
                  onSuccess={(value) => { console.log(value); }}
                  maxDaysBack={30}
                />
              }
              {this.showRegionDownload &&
                <RegionDownload
                  region={this.selectedPolygon}
                  close={(async () => { await this.discardSelectedRange(); }).bind(this)}
                  onSuccess={(async (range: BoundingTileDefinition ) => { await this.downloadSelectedRange(range); })}
                />
              }

              <MapView style={[styles.mapStyle, this.isOrientationLandscape && styles.mapStyleLandscape, !this.isOrientationLandscape && styles.mapStyleLandscapePortrait]}
                       rotateEnabled={false}
                       mapType="none"
                       onLongPress={(event) => { console.log(event); this.openMenu(event); }}
                       onPress={async (event) => { await this.onMapClick(event); }}
                       onRegionChange={region => {
                        clearTimeout(this.regionChangeTimeout);
                        this.regionChangeTimeout = setTimeout(() => {
                            let zoom = lonDeltaToZoom(region.longitudeDelta);
                            if (zoom != this.zoomLevel) {
                              this.zoomLevel = zoom;
                              console.log(zoom);
                            }
                        }, 100)
                      }}
              >
                {this.loadedTrackingTracks.map(track => {
                  let pointCount = track.getPoints().length;

                  return (
                    <React.Fragment key={track.id}>
                      <Polyline
                        coordinates={
                          track.getPolyLine()
                        }
                        strokeWidth={5}
                        strokeColor="#f00"
                        zIndex={1}
                        tappable={true}
                        onPress={async () => {
                          /*console.log('Loading tracking', track.id);
                          let result = await TrackingStore.getTracking(track.id);
                          console.log('Loading tracking result', result.data);
                          if (result.success) {
                            this.selectTracking(result.data);
                          }*/
                        }}
                      />

                      {track.getPoints().map((point, index) => {
                        let image = this.markers.markerElse;
                        let zIndex = 1;

                        if (index === 0) {
                          image = this.markers.markerFirst;
                          zIndex = 2;
                        } else if (index === pointCount - 1) {
                          image = this.markers.markerLast;
                          zIndex = 3;
                        }

                        return (
                          <React.Fragment key={point.id}>
                            {this.expandedPointId === point.id &&  
                              <Marker
                                coordinate={ { latitude: point.lat, longitude: point.lng } }
                                icon={image}
                                image={image}
                                zIndex={zIndex}
                              >
                                <Callout>
                                    <MarkerPosition tracking={track.tracking} id={point.id}/>
                                </Callout>
                              </Marker>
                            }
                            {this.expandedPointId !== point.id &&  
                              <Marker
                                coordinate={ { latitude: point.lat, longitude: point.lng } }
                                icon={image}
                                image={image}
                                zIndex={zIndex}
                                onPress={() => { this.expandedPointId = point.id; }}
                              >
                              </Marker>
                            }
                          </React.Fragment>
                        )
                      })}
                    </React.Fragment>
                  )
                })}

                {this.selectingOfflineRegion && 
                  <React.Fragment>
                      {this.selectedPolygon.map((point, index) => {
                          return (
                            <Marker
                              key={index}
                              draggable
                              coordinate={ point }
                              onDragStart={(props) => console.log(props)}
                            />
                          )
                      })}
                      {this.selectedPolygon.length !== 0 && <Polygon coordinates={this.selectedPolygon}/>}
                  </React.Fragment>
                }

                {(!this.isOnline || this.selectingOfflineRegion) && this.offlineAreas.map(x => {
                      return (
                        <Polygon
                          key={x.id}
                          coordinates={x.boundingBox}
                          strokeColor="#f00"
                          strokeWidth={3}
                        />
                      )
                    })
                }

                {this.layer && <UrlTile urlTemplate={this.layer.getTileUrl()} zIndex={-1} />}
                {this.displayLastPositions && this.mapTrackings.map(tracking => {
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
                          <TrackingMarker tracking={tracking}/>
                        </Callout>
                      </Marker>
                  )}
                )}
              </MapView>

              {this.showTrackingListOverlay &&
                  <TrackingList actions={this.getTrackingListActions()} trackings={this.mapTrackings}/>
              }

                <SlidingUpPanel
                  ref={c => (this.panel = c)}
                  draggableRange={this.isOrientationLandscape ? {top: hp('70%'), bottom: hp('20%')} : {top: hp('50%'), bottom: hp('10%')}}
                  animatedValue={this.draggedValue}
                  showBackdrop={false}
                  containerStyle={{ backgroundColor: "transparent" }}
                  snappingPoints={this.isOrientationLandscape ? [ hp('20%'), hp('70%')] : [ hp('10%'), hp('50%')]}
                >
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.panel}>
                      <View style={[styles.panelHeader, this.isOrientationLandscape && { height: hp('20%') }, !this.isOrientationLandscape && { height: hp('10%') }]}>
                        <View style={{ display: 'flex', alignItems: 'center', padding: 2, paddingTop: 10}}>
                          <View style={{ height: 2, backgroundColor: "#fff", width: 60}}>
                          </View>
                        </View>
                        <View style={styles.inputWrapper}>
                            <SearchBar
                              placeholder={'Search by name'}
                              containerStyle={{ backgroundColor: "transparent", borderWidth: 0, borderColor: "#fff", borderTopColor: "transparent", borderBottomColor: "transparent" }}
                              inputContainerStyle={{ backgroundColor: "#fff", borderWidth: 0, borderColor: "#fff", borderRadius: 5 }}
                              inputStyle={{ color: "#000" }}
                              onChangeText={(text) => { this.updateSearchText(text) }}
                              value={this.searchText}
                            />
                        </View>
                      </View>
                      <View style={[styles.container, !this.isOrientationLandscape && styles.containerPortrait]}>
                        <View style={styles.inputWrapperOffset}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Filters</Text>
                          <View style={{ display: 'flex', paddingTop: 5}}>
                            <View style={{ backgroundColor: '#fff', height: 2, flexGrow: 1 }}></View>
                          </View>
                        </View>

                        <View style={styles.inputWrapperOffset}>
                          <Text style={{marginBottom: 5, color: '#fff', fontWeight: 'bold'}}>
                            Species
                          </Text>
                          <View style={{ backgroundColor: '#fff', height: 40, display: 'flex', borderRadius: 5 }}>
                            <RNPickerSelect
                              onValueChange={(value) => { this.searchSpeciesId = value; console.log(this.searchSpeciesId); this.reloadSearch(); }}
                              placeholderTextColor='#7b8894'
                              style={{ inputIOS: { flexGrow: 1, color: '#7b8894', fontSize: 18, paddingLeft: 10, height: 40 }, inputAndroid: { flexGrow: 1, color: '#7b8894', fontSize: 18, paddingLeft: 10, height: 40 } }}
                              useNativeAndroidPickerStyle={false}
                              items={this.selectSpecies}
                            >
                            </RNPickerSelect>
                          </View>
                        </View>

                        <View style={styles.inputWrapperOffset}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Actions</Text>
                          <View style={{ display: 'flex', paddingTop: 5}}>
                            <View style={{ backgroundColor: '#fff', height: 2, flexGrow: 1 }}></View>
                          </View>
                        </View>

                        <View style={[styles.inputWrapperOffset, { display: 'flex', flexDirection: 'row' }]}>
                          <TouchableOpacity
                            style={{ marginRight: 5, display: 'flex', alignItems: 'center' }}
                            onPress={() => { this.showLayersOverlay = true }}
                          >
                            <Icon
                              raised
                              name='map'
                              type='font-awesome'
                              color={Theme.colors.brand.primary}
                              
                            />
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                              Map layers
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{ marginRight: 5, display: 'flex', alignItems: 'center' }}
                            onPress={() => { this.contextMenuVisible = true }}
                          >
                            <Icon
                              raised
                              name='bars'
                              type='font-awesome'
                              color={Theme.colors.brand.primary}
                            />
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                              Open menu
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </SlidingUpPanel>
          </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
  }
}

