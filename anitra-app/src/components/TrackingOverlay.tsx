import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay, Icon, Button } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import OverlayStore from "../store/OverlayStore";
import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import Layer from '../entities/Layer.js';
import { Tracking } from '../entities/Tracking.js';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import TrackingStore from '../store/TrackingStore';
import Photo from '../entities/Photo.js';
import ImageView from 'react-native-image-view';
import Flag from 'react-native-flags';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const {height, width} = Dimensions.get('window');

interface TrackingOverlayProps
{
    selectedTracking: Tracking,
    close: Function;
    loadTrackingTrack: Function;
    unloadTrackingTrack: Function;
}

@observer
export default class TrackingOverlay extends React.Component<TrackingOverlayProps> {

    @observable
    loading: boolean = true;

    @observable
    private tracking: Tracking;

    @observable
    private photos: Photo[] = [];

    @observable
    private isImageViewVisible: boolean = false;

    private closeFunction;
    private loadTrackingTrack;
    private unloadTrackingTrack;

    async getPhotos() {
        try {
            this.photos = await (await TrackingStore.getPhotos(this.tracking.id)).data;
        } catch (e) {
            console.log(e);
        }
    }

    @computed get componentPhotos()
    {
        return this.photos.map(x => {
            return {
                source: {
                    uri: x.getUrl()
                },
                title: x.uploaderName
            }
        });
    }

    async addPhoto() {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
              alert('Sorry, we need camera roll permissions to make this work!');
              return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.cancelled) {
            // save to action queue
        }
    }

    async componentDidMount() {
        this.loading = true;
        this.tracking = this.props.selectedTracking;
        this.closeFunction = this.props.close;
        this.loadTrackingTrack = this.props.loadTrackingTrack;
        this.unloadTrackingTrack = this.props.unloadTrackingTrack;
        await this.getPhotos();
        this.loading = false;
    }

    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={
                    {
                        display: "flex",
                        backgroundColor: "#fff",
                        flexDirection: "column",
                        alignItems: "center",
                        alignContent: "center",
                        padding: 0,
                        minWidth: width / 2,
                        borderRadius: 20,
                        overflow: 'hidden'
                    }
                }
                onBackdropPress={() => { this.closeFunction() }}
                width={wp('90%')}
                height={hp('80%')}
              >
            <ScrollView>
                <View style={{ width: wp('90%') }}>
                    {this.loading && <View><MaterialIndicator color={ Theme.colors.brand.primary }/></View>}
                    {!this.loading &&
                    <View>
                        <View style={{ backgroundColor: Theme.colors.brand.primary }}>
                            <View style={{ display: "flex", flexDirection: "row", padding: 10 }}>
                                <Text style={{ color: "#fff" }}>
                                    {this.tracking.getName()}
                                </Text>
                            </View>
                        </View>

                        <View style={{ padding: 10 }}>
                            <View>
                                <Text style={styles.label}>
                                    Species
                                </Text>
                                <Text>
                                    {this.tracking.species?.scientificName}
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.label}>
                                    Age
                                </Text>
                                <Text>
                                    {this.tracking.getAge()}
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.label}>
                                    Sex
                                </Text>
                                <Text>
                                    {this.tracking.sex}
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.label}>
                                    Last position
                                </Text>
                                <Text>
                                    {this.tracking.lastPosition?.country && 
                                        <Flag
                                            code={this.tracking.lastPosition?.country.toUpperCase()}
                                            size={16}
                                        />
                                    }
                                    {this.tracking.getLastPositionText()}
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.label}>
                                    Note
                                </Text>
                                <Text>
                                    {this.tracking.note}
                                </Text>
                            </View>
                        </View>

                        <View style={{ height: 140 }}>
                            <View>
                                <View style={{ backgroundColor: Theme.colors.brand.primary, padding: 10 }}>
                                    <Text style={{ color: "#fff" }}>
                                        Gallery
                                    </Text>
                                </View>
                                <ScrollView horizontal={true} style={{ height: 100 }}>
                                    <TouchableOpacity 
                                        style={{ display: "flex", flexDirection: "row", padding: 10 }} 
                                        onPress={() => { this.isImageViewVisible = true; }}
                                    >
                                        {this.componentPhotos.length > 0 &&
                                        <ImageView
                                            images={this.componentPhotos}
                                            imageIndex={0}
                                            isVisible={this.isImageViewVisible}
                                            renderFooter={(currentImage) => (
                                                <View>
                                                    <Text style={{ color: '#fff' }}>
                                                        Uploaded by: {currentImage.title}
                                                    </Text>
                                                </View>
                                            )}
                                            onClose={() => { this.isImageViewVisible = false; }}
                                        />}
                                        {this.photos.map(x => {
                                            return (
                                                <View key={x.id} style={{ height: 80, width: 80 }}>
                                                    <Image
                                                        style={{ width: 80, height: 80 }}
                                                        source={{ uri: x.getThumbUrl() }}
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                            )
                                        })}
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>

                        <View>
                            <View>
                                <View style={{ backgroundColor: Theme.colors.brand.primary, padding: 10 }}>
                                    <Text style={{ color: "#fff" }}>
                                        Actions
                                    </Text>
                                </View>

                                <View style={{ display: "flex", flexDirection: "row", padding: 10 }}>
                                    {/*<View style={styles.iconColumn}>
                                        <Icon
                                            raised
                                            name='sticky-note'
                                            type='font-awesome'
                                            color={Theme.colors.brand.primary}
                                            onPress={() => {  }}
                                        />
                                        <Text style={{ textAlign: "center" }}>
                                            Add note
                                        </Text>
                                    </View>*/}

                                    {/*<View style={styles.iconColumn}>
                                        <Icon
                                            raised
                                            name='camera'
                                            type='font-awesome'
                                            color={Theme.colors.brand.primary}
                                            onPress={async () => { await this.addPhoto() }}
                                        />
                                        <Text style={{ textAlign: "center" }}>
                                            Add photo
                                        </Text>
                                    </View>
                                    */}

                                    {!this.tracking.trackLoaded && 
                                        <TouchableOpacity
                                            style={styles.iconColumn} 
                                            onPress={() => { this.loadTrackingTrack(this.tracking) }}
                                        >
                                            <Icon
                                                raised
                                                name='map-marker'
                                                type='font-awesome'
                                                color={Theme.colors.brand.primary}
                                            />
                                            <Text style={{ textAlign: "center" }}>
                                                Load track
                                            </Text>
                                        </TouchableOpacity>
                                    }

                                    {this.tracking.trackLoaded && 
                                        <TouchableOpacity
                                            style={styles.iconColumn} 
                                            onPress={() => { this.unloadTrackingTrack(this.tracking) }}
                                        >
                                            <Icon
                                                raised
                                                name='map-marker'
                                                type='font-awesome'
                                                color={Theme.colors.brand.primary}
                                            />
                                            <Text style={{ textAlign: "center" }}>
                                                Unload track
                                            </Text>
                                        </TouchableOpacity>
                                    }

                                </View>
                            </View>
                        </View>
                    </View>
                    }
                </View>
            </ScrollView>

            </Overlay>
        )
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
    },
    iconColumn: {
        padding: 5,
        textAlign: "center"
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 5
    }
  });
  