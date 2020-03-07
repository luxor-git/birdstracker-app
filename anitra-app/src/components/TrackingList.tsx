import React from 'react';
import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, TouchableHighlight, TouchableOpacity, FlatList, Dimensions, SectionList } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { ListItem } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import { Icon } from 'react-native-elements'
import { Tracking } from '../entities/Tracking.js';

const {height} = Dimensions.get('window');

export interface TrackingListActions {
    refresh: Function;
    openDetail: Function;
};

interface TrackingListProps {
    trackings: Tracking[],
    actions: TrackingListActions
}

@observer
export default class TrackingList extends React.Component<TrackingListProps> {
    
    @observable
    loading: boolean = false;

    //private actions : ContextMenuActions;

    /*@observable
    private trackings: Tracking[];*/

    private actions : TrackingListActions;

    @computed get trackings() : Trackings[]
    {
        let trackings = this.props.trackings;
        let speciesMap = {};

        trackings.forEach(x => {
            let species = "None";
            if (x.species) {
                species = x.species?.scientificName;
            }

            if (!speciesMap[species]) {
                speciesMap[species] = {
                    title: species,
                    data: []
                };
            }

            speciesMap[species].data.push(x);
        });

        return Object.values(speciesMap);
    }

    async componentDidMount() {
        this.loading = true;
        //this.trackings = this.props.trackings;
        this.actions = this.props.actions;
        this.loading = false;
    }

    render() {
        return (
            <View style={styles.fullList}>
                <SectionList
                    keyExtractor={(item) => { return (item as Tracking).id.toString(); }}
                    onRefresh={async () => {
                        await this.actions.refresh();
                    }}
                    sections={this.trackings}
                    refreshing={this.loading}
                    renderItem={
                        ({ item }) => {
                            item = item as Tracking;
                            //subtitle={item}
                            return (
                                <ListItem 
                                    title={item.getName()}
                                    bottomDivider
                                    chevron
                                    onLongPress={() => {
                                        this.actions.openDetail(item)
                                    }}
                                >
                                </ListItem>
                            )
                        }
                    }
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeaderText}>{title}</Text>
                    )}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    fullList: {
        height: height
    },
    sectionHeaderText: {
        backgroundColor: Theme.colors.brand.primary,
        color: '#fff',
        padding: 10
    }
});