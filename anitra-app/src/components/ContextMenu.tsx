import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, TouchableOpacity  } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import OverlayStore from "../store/OverlayStore";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Layer from '../entities/Layer.js';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements'
import ContextMenuActions from '../common/ContextMenuActions';

interface ContextMenuProps {
    actions: ContextMenuActions;
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
                <View style={styles.rowButton}>
                    <Icon
                        name={icon}
                        type='font-awesome'
                        color={ Theme.colors.brand.primary }
                    />
                    
                    <Text>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <Overlay
                isVisible={true}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center"}}
                onBackdropPress={() => { this.actions.closeMenu() }}
              >
              <View>
                {this.loading && <MaterialIndicator color={ Theme.colors.brand.primary }/>}
                {!this.loading &&
                <View style={{flex: 1}}>
                    <ScrollView style={{flex: 1}}>
                        {this.button('heartbeat', 'Test', () => { console.log('hello'); })}
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