/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {
  MapViewStore,
  MiMapView,
  TGetVenueOptions,
} from '@mappedin/react-native-sdk';
import React, {useRef} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const BlueDotOnClick = () => {
  const mapView = useRef<MapViewStore>(null);
  const location = {
    timestamp: 1583957906820,
    coords: {
      accuracy: 5,
      latitude: 43.52012478635707,
      longitude: -80.53951744629536,
      floorLevel: 0,
    },
    type: 0,
  };

  return (
    <SafeAreaView style={styles.fullView}>
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        options={venueOptions}
        onFirstMapLoaded={() => {
          mapView.current?.BlueDot.enable({
            smoothing: false,
            showBearing: true,
          });
          mapView.current?.overrideLocation(location);
        }}
        onClick={({position}) => {
          mapView.current?.overrideLocation({
            ...location,
            coords: {
              accuracy: 3,
              latitude: position.latitude,
              longitude: position.longitude,
              floorLevel: mapView.current?.currentMap?.elevation,
            },
          });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
});

export default BlueDotOnClick;
