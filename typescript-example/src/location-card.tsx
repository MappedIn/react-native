import React, { useContext } from 'react';
import {
  Text,
  Image,
  View,
  ScrollView,
  Button,
  Dimensions,
} from 'react-native';
import { Card } from './card';
import { MiniMap } from './minimap';
import { APPSTATE, RootContext } from './app';

export const LocationCard = () => {
  const {
    selectedLocation,
    setDestination,
    directions,
    appState,
    setAppState,
    venueData,
    setDeparture,
    nearestLocation,
  } = useContext(RootContext);

  const height = Dimensions.get('window').height;

  return (
    <Card
      desiredHeight={directions != null ? height / 5 : height / 2}
      isOpen={appState === APPSTATE.PROFILE}
    >
      {directions == null && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{
                uri:
                  selectedLocation?.logo?.large || venueData?.venue.logo?.large,
              }}
              style={{
                margin: 10,
                height: 100,
                width: 100,
                alignSelf: 'center',
                aspectRatio: 135 / 76,
              }}
              resizeMode="contain"
            ></Image>
            <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 20 }}>
              {selectedLocation?.name}
            </Text>
          </View>
          <ScrollView>
            <Text style={{ fontSize: 16, padding: 10 }}>
              {selectedLocation?.description}
            </Text>
          </ScrollView>
        </>
      )}
      {selectedLocation != null && <MiniMap />}
      <Button
        title="Get Directions"
        onPress={async () => {
          setAppState(APPSTATE.DIRECTIONS);
          if (nearestLocation != null) {
            setDeparture(nearestLocation.clone());
          }
          setDestination(selectedLocation.clone());
        }}
      ></Button>
    </Card>
  );
};
