import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight  } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay, Icon } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import OverlayStore from "../store/OverlayStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Layer from '../entities/Layer.js';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as lor, removeOrientationListener as rol} from 'react-native-responsive-screen';

interface LayersOverlayProps
{
    setLayer: Function;
    selectedLayer: Layer;
    close: Function;
}

@observer
export default class LayersOverlay extends React.Component<LayersOverlayProps> {

    @observable
    loading: boolean = false;

    @observable
    layers: Layer[] = [];

    async componentDidMount() {
        this.loading = true;
        console.log(this.props);

        //this.props.selectedLayer

        this.layers = await OverlayStore.getAvailableLayers();
        
        this.loading = false;
    }

    async activateLayer (layer: Layer) {
        console.log(layer);
        console.log(this.props.setLayer);
        await this.props.setLayer(layer);
    }

    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column" }}
                onBackdropPress={() => { this.props.close() }}
              >
              <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {this.loading && <MaterialIndicator color={ Theme.colors.brand.primary }/>}
                {this.layers.map((x) => {
                    const isSelected = this.props.selectedLayer === x;
                    return (
                        <View key={x.name}>
                              <TouchableHighlight
                                    onPress={ () => { this.activateLayer(x) } }
                                    style={[{ backgroundColor: Theme.colors.default.background, height: hp('10%'), margin: 5, padding: 10 }, isSelected && {backgroundColor: Theme.colors.brand.primary}]}
                                >
                                <React.Fragment>
                                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                                        <View style={{ flexGrow: 1 }}>
                                            <Text style={[{ fontSize: hp('2%') }, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
                                                {x.name}
                                            </Text>
                                        </View>

                                        <View>
                                            {isSelected && <View>
                                                <Icon
                                                    name='check-square'
                                                    type='font-awesome'
                                                    color={'#fff'}
                                                    style={{ marginLeft: 'auto' }}
                                                />
                                            </View>}
                                        </View>
                                    </View>
                                </React.Fragment>
                            </TouchableHighlight>
                        </View>
                    )
                })}
              </View>
            </Overlay>
        )
    }
}