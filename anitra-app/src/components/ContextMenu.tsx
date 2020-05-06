import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, TouchableOpacity  } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay, ListItem } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import LocationStore from "../store/LocationStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Layer from '../entities/Layer.js';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements'
import ContextMenuActions from '../common/ContextMenuActions';


interface ContextMenuProps {
    actions: ContextMenuActions;
    hasTracks: boolean;
}

@observer
export default class ContextMenu extends React.Component<ContextMenuProps> {
    
    @observable
    loading: boolean = false;

    private actions : ContextMenuActions;

    async componentDidMount() {
        this.loading = true;
        this.actions = this.props.actions;
        this.loading = false;
    }

    button(icon, text, onPress) {
        return (
            <TouchableOpacity style={{flex: 1}} onPress={onPress}>
                <ListItem
                    leftAvatar={
                        <Icon
                            name={icon}
                            type='font-awesome'
                            color={ Theme.colors.brand.primary }
                        />
                    }
                    title={text}
                    bottomDivider
                />
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center", padding: 0}}
                onBackdropPress={() => { this.actions.closeMenu() }}
                width="auto"
              >
              <View>
                {this.loading && <MaterialIndicator color={ Theme.colors.brand.primary }/>}
                {!this.loading &&
                <View style={{flex: 1}}>
                    <ScrollView style={{flex: 1, width: 300}}>
                        {this.button('retweet', 'Refresh', async () => { await this.actions.refreshTrackings(); })}
                        
                        {this.button('list', 'Show tracking list', async () => { await this.actions.showTrackingList(); })}

                        {this.button('map', 'Download offline area', async () => { await this.actions.showOfflineAreaEdit(); })}

                        {this.props.hasTracks && 
                            this.button('strikethrough', 'Unload tracks', async () => { await this.actions.unloadTracks(); })
                        }

                        {!LocationStore.isLocationUpdateRunning() &&
                            this.button('location-arrow', 'Show current location', async () => { await this.actions.startLocationUpdates(); })
                        }

                        {LocationStore.isLocationUpdateRunning() &&
                            this.button('search', 'Zoom to my location', async () => { await this.actions.zoomToMyLocation(); })
                        }

                        {/*{LocationStore.isLocationUpdateRunning() && !LocationStore.isTrackRecordRunning() &&
                            this.button('location-arrow', 'Show and record track', async () => { await this.actions.startTrackRecord(); })
                        }*/}

                        {/*
                        {LocationStore.isLocationUpdateRunning() && LocationStore.isTrackRecordRunning() &&
                            this.button('location-arrow', 'Stop recording track', async () => { await this.actions.stopTrackRecord(); })
                        }
                        */}

                        {LocationStore.isLocationUpdateRunning() &&
                            this.button('location-arrow', 'Stop displaying location', async () => { await this.actions.stopLocationUpdates(); })
                        }

                        {this.button('user', 'Sign out', async () => { await this.actions.signOut(); })}
                    </ScrollView>
                </View>
                }
              </View>
            </Overlay>
        )
    }
}

const styles = StyleSheet.create({
    rowButton: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        height: 80,
        backgroundColor: 'red'
    }
});