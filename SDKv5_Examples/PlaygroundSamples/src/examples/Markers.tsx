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
  COLLISION_RANKING_TIERS,
  MapViewStore,
  MARKER_ANCHOR,
  MiMapView,
  TMapViewRNOptions,
  TMiMapViewVenueOptions,
  TShowVenueOptions,
} from '@mappedin/react-native-sdk';
import React, {useRef} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const venueOptions: TShowVenueOptions &
  TMiMapViewVenueOptions &
  TMapViewRNOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
  labelAllLocationsOnInit: false,
};

const Markers = () => {
  const mapView = useRef<MapViewStore>(null);

  return (
    <SafeAreaView style={styles.fullView}>
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        options={venueOptions}
        onFirstMapLoaded={() => {
          mapView.current?.FlatLabels.labelAllLocations();
        }}
        onClick={({polygons}) => {
          if (polygons.length > 0) {
            const location = polygons[0].locations[0];
            const entrance = polygons[0].entrances[0];

            if (!location || !entrance) return;

            mapView.current?.createMarker(
              entrance,
              `<div style="background-color:white; padding: 0.4rem; border-radius: 0.4rem;">${location.name}</div>`,
              {
                anchor: MARKER_ANCHOR.CENTER,
                rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE,
              },
            );
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

export default Markers;
