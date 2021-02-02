import React, { useContext, useEffect } from 'react';
import type { IMappedinMap } from '@mappedin/react-native-sdk';
import { Picker } from '@react-native-picker/picker';
import { RootContext } from './app';

export const MapPicker = () => {
  const {
    venueData,
    mapView,
    nearestLocation,
    selectedMapId,
    setSelectedMapId,
    setLoading,
  } = useContext(RootContext);

  useEffect(() => {
    async function setMap() {
      if (
        mapView.current?.currentMap?.id !== selectedMapId &&
        selectedMapId != null
      ) {
        setLoading(true);
        await mapView.current?.setMap(selectedMapId);
        mapView.current?.focusOn({
          polygons: venueData?.polygons.filter((p) => p.map === selectedMapId),
        });
        setLoading(false);
      }
    }
    setMap();
  }, [selectedMapId]);

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
        top: nearestLocation != null ? 110 : 0,
        right: 10,
      }}
      onValueChange={(itemValue) => {
        setSelectedMapId(itemValue as IMappedinMap['id']);
      }}
    >
      {venueData.maps.map((m) => (
        <Picker.Item key={m.id} label={m.name} value={m.id} />
      ))}
    </Picker>
  );
};
