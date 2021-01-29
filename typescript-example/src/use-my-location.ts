import React from 'react';
import RNLocation from 'react-native-location';
import type { TGeolocationObject } from '@mappedin/react-native-sdk';

RNLocation.configure({
  distanceFilter: 5.0,
});

export const useLocation = () => {
  const listen = React.useCallback<(prop: (obj: TGeolocationObject) => void) => void>((fn) => {
    RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'coarse',
      },
    }).then((granted) => {
      if (granted) {
        RNLocation.subscribeToLocationUpdates((locations) => {
          const {
            accuracy,
            floor,
            latitude,
            longitude,
            timestamp,
          } = locations[0];

          const l = {
            timestamp,
            coords: {
              latitude,
              longitude,
              accuracy,
              floorLevel: floor,
            },
          };
          fn(l);
        });
      }
    });
  }, []);

  return { listen };
};
