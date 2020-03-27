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
import { PositionData, Tracking } from '../entities/Tracking.js';

interface MarkerPositionProps
{
    id: number;
    tracking: Tracking;
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
                    <View>
                        <Text style={{ fontWeight: 'bold' }}>
                            {this.props.tracking.getName()}
                        </Text>
                    </View>

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

/*



   <Overlay
        isVisible={true}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayStyle={{display: "flex", backgroundColor: "#fff", flexDirection: "column", alignItems: "center", alignContent: "center", borderRadius: 20 }}
        height={hp('20%')}
        width={wp('50%')}
        >
        <View>
        <MaterialIndicator color={ Theme.colors.brand.primary }/>
        <Text style={{ minWidth: 200, textAlign: 'center' }}>{this.props.loadingText}...</Text>
        </View>
    </Overlay>


*/