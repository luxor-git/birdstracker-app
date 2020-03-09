import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Card, Avatar, Button } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import User from '../entities/User.js';
import { MaterialIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Tracking } from '../entities/Tracking.js';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Flag from 'react-native-flags';

interface TrackingMarkerProps
{
    tracking: Tracking;
}

@observer
export default class TrackingMarker extends React.Component<TrackingMarkerProps> {

    @observable
    private tracking: Tracking;

    componentDidMount() {
        this.tracking = this.props.tracking;
    }

    render () {
        return (
            <View style={styles.wrapper}>
                {this.tracking &&
                    <View>

                        <View>
                            <Text style={{ fontWeight: 'bold' }}>
                                {this.tracking.getName()}
                            </Text>
                        </View>

                        <View style={{display: 'flex'}}>
                            <Text style={{ fontStyle: 'italic' }}>
                                {this.tracking.species?.scientificName}
                            </Text>
                            <Text>
                                
                                {this.tracking.sex}
                                {this.tracking.age}
                            </Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            {this.tracking.lastPosition?.country && 
                                <Flag
                                    code={this.tracking.lastPosition?.country.toUpperCase()}
                                    size={16}
                                />
                            }
                            <Text style={{ fontSize: 10 }}>
                                {this.tracking.getLastPositionText()}
                            </Text>
                        </View>

                        <Text>
                            Device: {this.tracking.deviceCode}
                        </Text>

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