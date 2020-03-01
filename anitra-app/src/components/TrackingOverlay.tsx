import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, ScrollView } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay, Icon, Button } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import OverlayStore from "../store/OverlayStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Layer from '../entities/Layer.js';
import { Tracking } from '../entities/Tracking.js';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

@observer
export default class TrackingOverlay extends React.Component {

    @observable
    loading: boolean = true;

    @observable
    private tracking: Tracking;

    private closeFunction;
    private loadTrackingTrack;

    async getPhotos() {

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

        console.log(result);

        if (!result.cancelled) {
            // save to action queue
        }
    }

    async componentDidMount() {
        this.loading = true;
        this.tracking = this.props.selectedTracking;
        this.closeFunction = this.props.close;
        this.loadTrackingTrack = this.props.loadTrackingTrack;
        await this.getPhotos();
        this.loading = false;
    }

    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center", padding: 0}}
              >
              {this.loading && <View><MaterialIndicator color={ Theme.colors.brand.primary }/></View>}
              {!this.loading &&
              <View>
                  <View style={{ backgroundColor: Theme.colors.brand.primary }}>
                    <View style={{ display: "flex", flexDirection: "row", padding: 10 }}>
                        <Text style={{ color: "#fff" }}>
                            {this.tracking.getName()}
                        </Text>

                        <Text style={{ color: "#fff" }}>
                            {this.tracking.sex}
                        </Text>

                        <Text style={{ color: "#fff" }}>
                            {this.tracking.age}
                        </Text>

                        <View style={{ flexGrow: 1 }}>
                            <Button title={"x"} onPress={() => { this.closeFunction() }} buttonStyle={{ backgroundColor: "red", padding: 0, margin: 0, width: 30, height: 30 }}>
                                
                            </Button>
                        </View>
                    </View>
                  </View>

                  <View style={{ padding: 10 }}>
                        <View>
                            <Text>
                                Species
                            </Text>
                            <Text>
                                {this.tracking.species?.scientificName}
                            </Text>
                        </View>

                        <View>
                            <Text>
                                Last position
                            </Text>
                            <Text>
                                {this.tracking.lastPosition?.admin1}
                                {this.tracking.lastPosition?.admin2}
                                {this.tracking.lastPosition?.settlement}
                                {this.tracking.lastPosition?.country}
                            </Text>
                        </View>

                        <View>
                            <Text>
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
                            <View style={{ display: "flex", flexDirection: "row"}}>
                                <View style={{ height: 80, width: 80, backgroundColor: '#000', margin: 10 }}>
                                </View>
                                <View style={{ height: 80, width: 80, backgroundColor: '#000', margin: 10}}>
                                </View>
                                <View style={{ height: 80, width: 80, backgroundColor: '#000', margin: 10}}>
                                </View>
                                <View style={{ height: 80, width: 80, backgroundColor: '#000', margin: 10}}>
                                </View>
                                <View style={{ height: 80, width: 80, backgroundColor: '#000', margin: 10}}>
                                </View>
                                <View style={{ height: 80, width: 80, backgroundColor: '#000', margin: 10}}>
                                </View>
                            </View>
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

                        <View style={{ display: "flex", flexDirection: "row" }}>
                            <View style={styles.iconColumn}>
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
                            </View>

                            <View style={styles.iconColumn}>
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

                            <View style={styles.iconColumn}>
                                <Icon
                                    raised
                                    name='map-marker'
                                    type='font-awesome'
                                    color={Theme.colors.brand.primary}
                                    onPress={() => { this.loadTrackingTrack() }}
                                />
                                <Text style={{ textAlign: "center" }}>
                                    Load track
                                </Text>
                            </View>

                            <View style={styles.iconColumn}>
                                <Icon
                                    raised
                                    name='wifi'
                                    type='font-awesome'
                                    color={Theme.colors.brand.primary}
                                    onPress={() => {  }}
                                />
                                <Text style={{ textAlign: "center" }}>
                                    Offline
                                </Text>
                            </View>
                        </View>
                    </View>
                  </View>
              </View>
              }

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
    }
  });
  