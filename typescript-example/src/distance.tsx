import React, {useContext, useEffect} from 'react';
import {Dimensions, View, Text, Button} from 'react-native';
import {Card} from './card';
import {APPSTATE, RootContext} from './app';
import {MARKER_ANCHOR} from '@mappedin/react-native-sdk';

export const DistanceCard = () => {
  const {mapView, distancePoints, setDistancePoints, appState} = useContext(
    RootContext,
  );

  const markers = React.useRef<[string | null, string | null]>([null, null]);
  const [distance, setDistance] = React.useState(0);

  function reset() {
    markers.current.forEach((m) => {
      if (typeof m === 'string') {
        mapView.current?.removeMarker(m);
      }
    });
    mapView.current?.clearAllPolygonColors();
    setDistancePoints([null, null]);
    markers.current = [null, null];
    setDistance(0);
  }

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  useEffect(() => {
    if (markers.current[0] == null && distancePoints[0] != null) {
      markers.current[0] = mapView.current!.createMarker(
        distancePoints[0].entrances[0],
        `
            <div style="width: 32px; height: 32px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.334 293.334"><g fill="#010002"><path d="M146.667 0C94.903 0 52.946 41.957 52.946 93.721c0 22.322 7.849 42.789 20.891 58.878 4.204 5.178 11.237 13.331 14.903 18.906 21.109 32.069 48.19 78.643 56.082 116.864 1.354 6.527 2.986 6.641 4.743.212 5.629-20.609 20.228-65.639 50.377-112.757 3.595-5.619 10.884-13.483 15.409-18.379a94.561 94.561 0 0016.154-24.084c5.651-12.086 8.882-25.466 8.882-39.629C240.387 41.962 198.43 0 146.667 0zm0 144.358c-28.892 0-52.313-23.421-52.313-52.313 0-28.887 23.421-52.307 52.313-52.307s52.313 23.421 52.313 52.307c0 28.893-23.421 52.313-52.313 52.313z"/><circle cx="146.667" cy="90.196" r="21.756"/></g></svg>
            </div>
            `,
        {
          anchor: MARKER_ANCHOR.TOP,
        },
      );
      mapView.current?.setPolygonColor(distancePoints[0].id, 'red');
    }

    if (markers.current[1] == null && distancePoints[1] != null) {
      markers.current[1] = mapView.current!.createMarker(
        distancePoints[1].entrances[0],
        `
                  <div style="width: 32px; height: 32px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.334 293.334"><g fill="#010002"><path d="M146.667 0C94.903 0 52.946 41.957 52.946 93.721c0 22.322 7.849 42.789 20.891 58.878 4.204 5.178 11.237 13.331 14.903 18.906 21.109 32.069 48.19 78.643 56.082 116.864 1.354 6.527 2.986 6.641 4.743.212 5.629-20.609 20.228-65.639 50.377-112.757 3.595-5.619 10.884-13.483 15.409-18.379a94.561 94.561 0 0016.154-24.084c5.651-12.086 8.882-25.466 8.882-39.629C240.387 41.962 198.43 0 146.667 0zm0 144.358c-28.892 0-52.313-23.421-52.313-52.313 0-28.887 23.421-52.307 52.313-52.307s52.313 23.421 52.313 52.307c0 28.893-23.421 52.313-52.313 52.313z"/><circle cx="146.667" cy="90.196" r="21.756"/></g></svg>
                  </div>
                  `,
        {
          anchor: MARKER_ANCHOR.TOP,
        },
      );
      mapView.current?.setPolygonColor(distancePoints[1].id, 'red');
    }
    if (distancePoints[0] != null && distancePoints[1] != null) {
      setDistance(
        Math.floor(distancePoints[0].distanceTo(distancePoints[1], {})),
      );
    }
  }, [distancePoints]);

  const height = Dimensions.get('window').height;

  return (
    <Card desiredHeight={height / 4} isOpen={appState === APPSTATE.DISTANCE}>
      <View style={{flex: 1}}>
        <Text style={{color: 'black', fontSize: 20, alignSelf: 'center'}}>
          Tap on two points to calculate distance
        </Text>
        <View
          style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 18}}>Departure: </Text>
            <View
              style={{
                flex: 1,
              }}>
              <Text style={{fontSize: 18}}>
                {distancePoints?.[0]?.locations[0].name}
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 18}}>Destination: </Text>
            <View
              style={{
                flex: 1,
              }}>
              <Text style={{fontSize: 18}}>
                {distancePoints?.[1]?.locations[0].name}
              </Text>
            </View>
          </View>
        </View>
        {distance !== 0 && (
          <View style={{flexDirection: 'row', marginBottom: 10}}>
            <Text style={{fontSize: 20}}>Distance: </Text>
            <Text style={{fontSize: 20, flex: 1}}>{distance} meters</Text>
          </View>
        )}
        <Button
          title="Reset"
          onPress={() => {
            reset();
          }}></Button>
      </View>
    </Card>
  );
};
