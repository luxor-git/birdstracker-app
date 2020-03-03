import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, TouchableOpacity  } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { Overlay, ListItem } from 'react-native-elements';
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
              >
              <View>
                {this.loading && <MaterialIndicator color={ Theme.colors.brand.primary }/>}
                {!this.loading &&
                <View style={{flex: 1}}>
                    <ScrollView style={{flex: 1, width: 300}}>
                        {this.button('retweet', 'Refresh', async () => { await this.actions.refreshTrackings(); })}
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