import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog } from 'react-native-simple-dialogs';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import { Slider } from 'react-native-elements';

interface TrackingDataSliderProps
{
    maxDaysBack: number;
    close: Function;
    onSuccess: Function;
}

@observer
export default class TrackingDataSlider extends React.Component<TrackingDataSliderProps> {

    @observable
    private value : number = 0;

    render() {
        return (
            <Dialog
                visible={true}
                title="Select days back"
                message="Select the amount of days you want to download"
                onTouchOutside={() => this.props.close() }
                positiveButton={{
                    title: "Download",
                    onPress: () => this.props.onSuccess(
                        this.value
                    )
                }}
                negativeButton={{
                    title: "NO",
                    onPress: () => this.props.close()
                }}
                >
                <View>
                    <Slider
                        value={this.value}
                        step={1}
                        maximumValue={this.props.maxDaysBack}
                        onValueChange={value => { this.value = value; }}
                    />
                    <Text>{this.value}</Text>
                </View>
            </Dialog>
        )
    }

}