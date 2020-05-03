import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog } from 'react-native-simple-dialogs';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import { Slider } from 'react-native-elements';
import { LatLng } from 'react-native-maps';
import { getBoundingTileArray, BoundingTileDefinition } from '../common/GeoUtils';
import Constants from '../constants/Constants';

interface RegionDownloadProps
{
    region: LatLng[],
    close: Function,
    onSuccess: Function
}

@observer
export default class RegionDownload extends React.Component<RegionDownloadProps> {

    @observable
    private value : number = 0;

    @observable
    private loading = true;

    @observable
    private tileCount = 0;

    @computed get expectedFilesize() : string
    {
        let size : number = this.tileCount * Constants.EXPECTED_TILE_FILESIZE;
        let i : number = Math.floor( Math.log(size) / Math.log(1024) );
        return (( size / Math.pow(1024, i) ).toFixed(2) * 1) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }

    private range : BoundingTileDefinition = null;

    componentDidMount() 
    {
        this.loading = true;
        let region = getBoundingTileArray(this.props.region, Constants.DEFAULT_CACHE_ZOOM_LEVELS);
        this.tileCount = region.tileCount;
        this.range = region;
        this.loading = false;
    }

    render() {
        return (
            <ConfirmDialog
                visible={true}
                title="Confirm area download"
                onTouchOutside={() => this.props.close() }
                positiveButton={{
                    title: "Download selection",
                    onPress: () => this.props.onSuccess(
                        this.range
                    )
                }}
                negativeButton={{
                    title: "Discard selection",
                    onPress: () => this.props.close()
                }}
                >
                <View>
                    {this.loading && <View>
                        <Text>Calculating...</Text>
                    </View>}
                    {!this.loading && <View>
                        <Text>
                            Expected total download size: {this.expectedFilesize}
                        </Text>
                    </View>}
                </View>
            </ConfirmDialog>
        )
    }

}