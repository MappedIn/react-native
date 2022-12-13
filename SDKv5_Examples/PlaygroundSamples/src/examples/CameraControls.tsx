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
  TCameraTransform,
  TGetVenueOptions,
} from '@mappedin/react-native-sdk';
import React, {useEffect, useRef, useState} from 'react';
import {Button, SafeAreaView, StyleSheet, View} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const CameraControls = () => {
  const mapView = useRef<MapViewStore>(null);
  const [departure, setDeparture] = useState<MappedinLocation>();
  const [destination, setDestination] = useState<MappedinLocation>();
  const [defaultCameraPosition, setDefaultCameraPosition] =
    useState<TCameraTransform>();

  const setLocations = () => {
    setDeparture(
      mapView.current?.venueData?.locations.find(
        (l: MappedinLocation) => l.name === 'Pet World',
      ),
    );
    setDestination(
      mapView.current?.venueData?.locations.find(
        (l: MappedinLocation) => l.name === 'Microsoft',
      ),
    );
  };

  useEffect(() => {
    if (!departure || !destination) {
      return;
    }
    const directions = departure?.directionsTo(destination);
    if (directions) {
      mapView.current?.Journey.draw(directions);
      mapView.current?.Camera.focusOn({
        polygons: [...departure.polygons, ...destination.polygons],
        nodes: directions.path,
      });
    }
  }, [departure, destination]);

  return (
    <SafeAreaView style={styles.fullView}>
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        options={venueOptions}
        onFirstMapLoaded={() => {
          setLocations();
          console.log(mapView.current?.Camera.position);
          setDefaultCameraPosition({
            tilt: mapView.current!.Camera.tilt,
            zoom: mapView.current!.Camera.zoom,
            rotation: mapView.current!.Camera.rotation,
            position: mapView.current!.Camera.position,
          });
        }}
        onClick={({polygons}) => {
          if (polygons.length === 0) return;

          mapView.current?.Camera.focusOn({
            polygons,
          });
        }}
      />
      <View style={styles.cameraButtonsRow}>
        <Button
          title="Increase tilt"
          onPress={() => {
            if (!mapView.current) return;
            const currentTilt = mapView.current.Camera.tilt;
            const delta = Math.PI / 6;

            mapView.current.Camera.set({
              tilt: currentTilt + delta,
            });
          }}
        />

        <Button
          title="Decrease tilt"
          onPress={() => {
            if (!mapView.current) return;
            const currentTilt = mapView.current.Camera.tilt;
            const delta = Math.PI / 6;

            mapView.current.Camera.set({
              tilt: currentTilt - delta,
            });
          }}
        />
      </View>
      <View style={styles.cameraButtonsRow}>
        <Button
          title="Zoom in"
          onPress={() => {
            if (!mapView.current) return;
            const currentZoom = mapView.current.Camera.zoom;
            const delta = 800;

            mapView.current.Camera.set({
              zoom: currentZoom - delta,
            });
          }}
        />

        <Button
          title="Zoom out"
          onPress={() => {
            if (!mapView.current) return;
            const currentZoom = mapView.current.Camera.zoom;
            const delta = 800;

            mapView.current.Camera.set({
              zoom: currentZoom + delta,
            });
          }}
        />
      </View>
      <Button
        title="Reset"
        onPress={() => {
          mapView.current?.Camera.set(defaultCameraPosition!);
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
  cameraButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export default CameraControls;
