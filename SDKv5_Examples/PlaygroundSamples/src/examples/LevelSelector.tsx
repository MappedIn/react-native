/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {MappedinMap, MapViewStore, MiMapView} from '@mappedin/react-native-sdk';
import {TGetVenueOptions} from '@mappedin/react-native-sdk/core/packages/renderer/index.rn';
import {Picker} from '@react-native-picker/picker';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const LevelSelector = () => {
  const mapView = useRef<MapViewStore>(null);
  const [levels, setLevels] = useState<MappedinMap[]>();
  const [selectedMapId, setSelectedMapId] = useState<MappedinMap['id']>();
  const MapPicker = () => {
    if (!levels) {
      return null;
    }

    return (
      <Picker
        mode="dropdown"
        selectedValue={selectedMapId}
        onValueChange={mapId => {
          setSelectedMapId(mapId);
        }}>
        {levels.map(m => (
          <Picker.Item key={m.id} label={m.name} value={m.id} />
        ))}
      </Picker>
    );
  };

  useEffect(() => {
    async function setMap() {
      if (selectedMapId && selectedMapId !== mapView.current?.currentMap?.id) {
        await mapView.current?.setMap(selectedMapId);
      }
    }
    setMap();
  }, [selectedMapId]);

  return (
    <SafeAreaView style={styles.fullSafeAreaView}>
      <MapPicker />
      <MiMapView
        style={styles.mapView}
        ref={mapView}
        key="mappedin"
        options={venueOptions}
        onFirstMapLoaded={() => {
          setSelectedMapId(mapView.current?.currentMap?.id);
          setLevels(mapView.current?.venueData?.maps);
        }}
        onMapChanged={({map}) => {
          setSelectedMapId(map.id);
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
  },
  picker: {
    height: '80 pt',
  },
});

export default LevelSelector;
