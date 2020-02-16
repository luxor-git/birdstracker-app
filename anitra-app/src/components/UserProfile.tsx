import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Card, Avatar, Button } from 'react-native-elements';
import Theme from "../constants/Theme.js";
import User from '../entities/User.js';
import { MaterialIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class UserProfile extends React.Component {

    componentDidMount()  {
        console.log(this.props.user);
        console.log(this.props.settingsButton);
    }

    settingsButton = async () => {
        console.log('pressed');
    }

    render () {
        return (
            <View style={styles.wrapper}>
                <View>
                    <Avatar rounded icon={{ name: 'home' }} />
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text>
                        Welcome,
                    </Text>
                    <Text>
                        {this.props.user.firstName + ' ' + this.props.user.lastName}
                    </Text>
                </View>
                {/*<View>
                    <Button
                        title="Clear button"
                        icon={
                            <Icon
                                name="wrench"
                                size={15}
                                color="white"
                            />
                        }
                        onPress={ () => this.settingsButton }
                    />
                    </View>*/}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row'
    }
});