import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay } from 'react-native-elements';
import Theme from "../constants/Theme.js";

export default class LoadingOverlay extends React.Component {
    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center"}}
              >
              <View>
                <MaterialIndicator color={ Theme.colors.brand.primary }/>
                <Text>{this.props.loadingText}...</Text>
              </View>
            </Overlay>
        )
    }
}