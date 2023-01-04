import {
  MappedinDirections,
  MappedinLocation,
  MapViewStore,
  MiMapView,
  TGetVenueOptions,
  TMappedinDirective,
} from '@mappedin/react-native-sdk';
import React, {useRef} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const Tooltips = () => {
  const mapView = useRef<MapViewStore>(null);

  return (
    <SafeAreaView style={styles.fullSafeAreaView}>
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        options={venueOptions}
        onFirstMapLoaded={() => {
          mapView.current?.Camera.set({
            position: mapView.current?.currentMap?.createCoordinate(
              43.52080783999876,
              -80.53909680942026,
            ),
            zoom: 1871,
          });
          const departure: MappedinLocation =
            mapView.current?.venueData?.locations.find(
              (l: MappedinLocation) => l.name === 'Cleo',
            );
          const destination: MappedinLocation =
            mapView.current?.venueData?.locations.find(
              (l: MappedinLocation) => l.name === 'Pandora',
            );
          if (!departure || !destination) {
            return;
          }
          const directions: MappedinDirections =
            departure?.directionsTo(destination);
          if (directions) {
            mapView.current?.drawPath(directions.path, {});
            directions.instructions.forEach(
              (instruction: TMappedinDirective) => {
                mapView.current?.createTooltip(
                  instruction.node,
                  `<span style="background-color: azure; padding:0.2rem; font-size:0.7rem">${instruction.instruction}</span>`,
                );
              },
            );
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullSafeAreaView: {
    flex: 1,
  },
  mapView: {
    flex: 1,
    custom: {
      backgroundColor: 'red',
    },
  },
});

export default Tooltips;
