import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Theme from "../../constants/Theme.js";
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView source={{ uri: 'https://app.anitra.cz/sign/up' }} style={{ marginTop: 20 }} />
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
