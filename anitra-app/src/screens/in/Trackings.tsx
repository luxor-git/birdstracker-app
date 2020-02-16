import React from 'react';
import { StyleSheet, Text, View, SectionList, FlatList } from 'react-native';
import Theme from "../../constants/Theme.js";
import TrackingStore from "../../store/TrackingStore";
import { Tracking } from '../../entities/Tracking.js';

export default class Trackings extends React.Component {

  state = {
    trackingList: [],
    listLoaded: false,
  }

  async componentDidMount() {
    this.setState({
      listLoaded: false
    });

    this.setState({
      trackingList: await TrackingStore.getTrackingList(),
      listLoaded: true
    });
  }

  render () { 
      let contents;

      if (this.state.listLoaded) {
        contents = <FlatList
          data={ this.state.trackingList }
          keyExtractor={ item => item.id }
          renderItem={({item}) => <Text style={styles.item}>{ item.getName() }</Text>}
        />
      } else {
        contents = <Text>Loading...</Text>
      }

      return (
        <View style={styles.container}>
          {contents}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.default.background,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

/*

<SectionList
  sections={[
    {title: 'D', data: ['Devin', 'Dan', 'Dominic']},
    {title: 'J', data: ['Jackson', 'James', 'Jillian', 'Jimmy', 'Joel', 'John', 'Julie']},
  ]}
  renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
  renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
  keyExtractor={(item, index) => index}
/>

*/