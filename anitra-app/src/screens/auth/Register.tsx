import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Theme from "../../constants/Theme.js";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Register page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.default.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
