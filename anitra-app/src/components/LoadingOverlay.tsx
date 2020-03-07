import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay } from 'react-native-elements';
import Theme from "../constants/Theme.js";

interface LoadingOverlayProps {
  loadingText: string;
};

export default class LoadingOverlay extends React.Component<LoadingOverlayProps> {
    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center"}}
                height="auto"
                width="auto"
              >
              <View>
                <MaterialIndicator color={ Theme.colors.brand.primary }/>
                <Text style={{ minWidth: 200 }}>{this.props.loadingText}...</Text>
              </View>
            </Overlay>
        )
    }
}