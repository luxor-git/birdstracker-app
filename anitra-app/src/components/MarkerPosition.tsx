import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Card, Avatar, Button } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import User from '../entities/User.js';
import { MaterialIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/FontAwesome';
import TrackingStore from '../store/TrackingStore';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { PositionData } from '../entities/Tracking.js';

interface MarkerPositionProps
{
    id: number;
}

@observer 
export default class MarkerPosition extends React.Component<MarkerPositionProps> {

    @observable
    private isLoading : boolean = true;

    @observable
    private positionData: PositionData;

    async componentDidMount()
    {
        this.isLoading = true;
        this.positionData = await TrackingStore.getPoint(this.props.id);
        this.isLoading = false;
        console.log(this.positionData);
    }

    render () {
        return (
            <View style={styles.wrapper}>
                {this.isLoading && <MaterialIndicator color={ Theme.colors.brand.primary }/>}
                {!this.isLoading && <View>
                    {Array.from(this.positionData.pointData).map(pair => {
                        return (
                            <View key={pair[0]} style={{ display: 'flex', flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold' }}>{pair[0].replace(/&nbsp;/g, ' ')}: </Text>
                                <Text>{pair[1]}</Text>
                            </View>
                        )
                    })}
                </View>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row'
    }
});