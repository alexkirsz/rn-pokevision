import React from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

function UnsupportedPlatform() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Unsupported platform
      </Text>
    </View>
  );
}

AppRegistry.registerComponent('Pokevision', () => UnsupportedPlatform);
