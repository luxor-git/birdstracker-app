import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Card, Avatar, Button } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import User from '../entities/User.js';
import { MaterialIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class Position extends React.Component {
    render () {
        return (
            <View style={styles.wrapper}>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row'
    }
});