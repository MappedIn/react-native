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
  MappedinLocation,
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

const ABWayfinding = () => {
  const mapView = useRef<MapViewStore>(null);

  return (
    <SafeAreaView style={styles.fullView}>
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        options={venueOptions}
        onFirstMapLoaded={() => {
          const departure = mapView.current?.venueData?.locations.find(
            (l: MappedinLocation) => l.name === 'Uniqlo',
          );
          const destination = mapView.current?.venueData?.locations.find(
            (l: MappedinLocation) => l.name === 'Microsoft',
          );
          if (!departure || !destination) {
            return;
          }
          const directions = departure?.directionsTo(destination);
          if (directions) {
            mapView.current?.Journey.draw(directions);
          }
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

export default ABWayfinding;
