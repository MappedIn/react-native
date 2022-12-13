/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {MiMapView} from '@mappedin/react-native-sdk';
import {TGetVenueOptions} from '@mappedin/react-native-sdk/core/packages/renderer/index.rn';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const RenderMap = () => {
  return (
    <SafeAreaView style={styles.fullSafeAreaView}>
      <MiMapView style={styles.mapView} key="mappedin" options={venueOptions} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullSafeAreaView: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
});

export default RenderMap;
