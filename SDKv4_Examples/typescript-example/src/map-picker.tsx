import React, { useContext, useEffect } from 'react';
import type { MappedinMap } from '@mappedin/react-native-sdk';
import { Picker } from '@react-native-picker/picker';
import { RootContext } from './app';

export const MapPicker = () => {
  const {
    venueData,
    mapView,
    selectedMapId
  } = useContext(RootContext);

  if (venueData == null) {
    return null;
  }

  return (
    <Picker
      mode="dialog"
      selectedValue={selectedMapId}
      style={{
        backgroundColor: '#DDD',
        alignContent: 'center',
        color: '#333',
        borderRadius: 10,
        borderColor: '#AAA',
        zIndex: 9999,
        height: 50,
        position: 'absolute',
        width: 150,
        top: 110,
        right: 10,
      }}
      onValueChange={(itemValue) => {
        mapView.current?.setMap(itemValue as MappedinMap['id']);
      }}
    >
      {venueData.maps.map((m) => (
        <Picker.Item key={m.id} label={m.name} value={m.id} />
      ))}
    </Picker>
  );
};
