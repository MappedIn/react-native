import React, { useContext, useEffect } from 'react';
import { Text, View } from 'react-native';
import { IMappedinLocation } from '@mappedin/react-native-sdk';
import { RootContext } from './app';
import { Picker } from '@react-native-picker/picker';

export const DirectionsPicker = () => {
  const { selectedLocation, venueData, mapView } = useContext(RootContext);

  const dummyLocation = { id: '-1', name: 'Get Directions to:' };
  const [destination, setDestination] = React.useState<IMappedinLocation>(
    dummyLocation as IMappedinLocation,
  );

  useEffect(() => {
    if (
      selectedLocation == null ||
      destination == null ||
      destination.id == '-1'
    ) {
      return;
    }
    async function getDirections() {
      const directions = await mapView.current?.getDirections({
        from: selectedLocation,
        to: destination,
      });

      if (directions == null || directions.path.length === 0) {
        console.log('Unable to navigate');
      }

      mapView.current?.removeAllPaths();
      mapView.current?.setPolygonColor(destination.polygons[0].id, 'red');
      // @ts-ignore
      await mapView.current?.drawPath(directions.path, {});
      await mapView.current?.focusOn({
        // @ts-ignore
        nodes: directions.path.map((n) => n.id),
        minZoom: 1000,
        padding: {
          top: 0,
          left: 20,
          right: 20,
          bottom: 500,
        },
      });
    }

    getDirections();
  }, [destination]);

  useEffect(() => {
    setDestination(dummyLocation as IMappedinLocation);
  }, [selectedLocation]);

  if (selectedLocation == null || venueData == null) {
    return null;
  }

  return (
    <View style={{ display: 'flex' }}>
      <Picker
        selectedValue={destination?.id}
        mode="dropdown"
        style={{
          backgroundColor: '#DDD',
          alignContent: 'center',
          marginTop: 10,
          marginBottom: 10,
          color: '#333',
          borderRadius: 10,
          borderColor: '#AAA',
        }}
        onValueChange={(locationId) => {
          setDestination(venueData.locations.find((l) => l.id === locationId)!);
        }}
      >
        {[dummyLocation, ...venueData.locations].map((l) => (
          <Picker.Item key={l.id} label={l.name} value={l.id} />
        ))}
      </Picker>
    </View>
  );
};
