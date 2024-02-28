import {
  MappedinDirections,
  MappedinLocation,
  MapViewStore,
  MiMapView,
  TGetVenueOptions,
  TMappedinDirective,
} from '@mappedin/react-native-sdk';
import React, {useRef, useState} from 'react';
import {
  FlatList,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// See Trial API key Terms and Conditions
// https://developer.mappedin.com/api-keys/
const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const DirectionsFlatList = ({directions}: {directions: MappedinDirections}) => {
  const renderItem: ListRenderItem<TMappedinDirective> = ({item: step}) => (
    <Text style={styles.step}>{step.instruction}</Text>
  );

  return (
    directions && (
      <FlatList data={directions.instructions} renderItem={renderItem} />
    )
  );
};

const TurnByTurnDirections = () => {
  const mapView = useRef<MapViewStore>(null);
  const [activeDirections, setActiveDirections] =
    useState<MappedinDirections>(null);

  return (
    <SafeAreaView style={styles.fullSafeAreaView}>
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
            setActiveDirections(directions);
          }
        }}
      />
      <View style={styles.directionsView}>
        <DirectionsFlatList directions={activeDirections} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  step: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    padding: 16,
    marginVertical: 4,
  },
  fullSafeAreaView: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
  directionsView: {
    flex: 1,
  },
});

export default TurnByTurnDirections;
