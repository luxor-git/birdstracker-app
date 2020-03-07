import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight  } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import OverlayStore from "../store/OverlayStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Layer from '../entities/Layer.js';

interface LayersOverlayProps
{
    setLayer: Function;
    selectedLayer: Layer;
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
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center"}}
              >
              <View>
                {this.loading && <MaterialIndicator color={ Theme.colors.brand.primary }/>}
                {this.layers.map((x) => {
                    return (
                        <View key={x.name}>
                              <TouchableHighlight
                                    onPress={ () => { this.activateLayer(x) } }
                                >
                                <Text>{x.name}</Text>
                            </TouchableHighlight>
                        </View>
                    )
                })}
              </View>
            </Overlay>
        )
    }
}