import React from 'react';
import RNLocation from 'react-native-location';
import type {TGeolocationObject} from '@mappedin/react-native-sdk';
import {IRootContext} from './app';

RNLocation.configure({
  distanceFilter: 5.0,
});

export const useLocation = ({venueData, mapView }: IRootContext) => {
  const [enabled, setEnabled] = React.useState(false);

  const listen = React.useCallback<
    (prop: (obj: TGeolocationObject) => void) => void
  >((fn) => {
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

  React.useEffect(() => {
    if (venueData != null && enabled === true && mapView != null) {
      return;
    }
    mapView.current!.BlueDot.enable({
      allowImplicitFloorLevel: true,
    });
    listen((location) => {
      console.log(location);
      mapView!.current!.overrideLocation(location);
    });
  }, [venueData, enabled]);

  return {
    isEnabled: enabled,
    enable() {
      setEnabled(true);
    },
    disable() {
      setEnabled(false);
    },
  };
};
