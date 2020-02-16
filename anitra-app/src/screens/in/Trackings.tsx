import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Theme from "../../constants/Theme.js";
import TrackingStore from "../../store/TrackingStore";
import { Tracking } from '../../entities/Tracking.js';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ListItem, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

const pageTitle = 'Trackings';

@observer
export default class Trackings extends React.Component {

  @observable
  trackingList: Tracking[] = [];

  @observable
  listLoaded: boolean = false;

  async componentDidMount() {
      this.listLoaded = false;
      TrackingStore.getTrackingList().then((data) => {
        console.log(data);
        this.trackingList = data.data;
        this.listLoaded = true;
      });
  }

  render () { 
      let contents;
      let listItems = this.trackingList;

      const keyExtractor = (item, index) => index.toString();

      const renderItem = ({item}) => (
        <ListItem
            key={item.id}
            title={item.getName()}
            subtitle={"test"}
            bottomDivider
            chevron
          />
      )

      if (this.listLoaded) {
        contents = <FlatList
          data={this.trackingList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      } else {
        contents = <Text>Loading...</Text>
      }

      return (
        <View style={styles.container}>
          <Header
            placement="left"
            centerComponent={{ text: pageTitle, style: { color: '#fff' } }}
            rightComponent={{ icon: 'paw', type: 'font-awesome', color: '#fff' }}
          />
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

leftAvatar={{ source: { uri: l.avatar_url } }}

*/