import React, {useContext, useEffect} from 'react';
import {
  MARKER_ANCHOR,
  MiMapView,
  TMiMapViewOptions,
} from '@mappedin/react-native-sdk';
import {RootContext, APPSTATE} from './app';
import {View} from 'react-native';

export const Map = ({options}: {options: TMiMapViewOptions}) => {
  const {
    mapView,
    setVenue,
    directions,
    selectedMapId,
    setMapState,
    setSelectedMapId,
    setCurrentLevel,
    setSelectedLocation,
    setNearestLocation,
    venueData,
    distancePoints,
    setDistancePoints,
    reset,
    appState,
    setMapDimensions,
    setAppState,
    setLoading,
  } = useContext(RootContext);

  useEffect(() => {
    async function setMap() {
      if (directions != null) {
        await mapView.current?.Camera.focusOn({
          targets: {
            nodes: directions.path
              .filter((n) => n.map === selectedMapId)
          },
          cameraOptions: {
            minZoom: 1500,
            tilt: 0.1,
            safeAreaInsets: {
              top: 40,
              left: 40,
              right: 40,
              bottom: 250,
            },
          }
        });
      } else if (
        selectedMapId != null &&
        mapView.current?.currentMap?.id !== selectedMapId
      ) {
        if (mapView.current?.currentMap?.id !== selectedMapId) {
          await mapView.current?.setMap(selectedMapId);
        }
        if (directions == null) {
          await mapView.current?.Camera.focusOn({
            targets: {
              polygons: venueData?.polygons.filter(
                (p) => p.map === selectedMapId,
              ),
            }
          });
        }
      }
    }
    setMap();
  }, [selectedMapId]);

  return (
    <View
      style={{flex: 1}}
      onLayout={(event) => {
        const {width, height} = event.nativeEvent.layout;
        setMapDimensions({width, height});
      }}>
      <MiMapView
        style={{flex: 1}}
        key="mappedin"
        ref={(ctrl) => {
          if (ctrl != null) {
            mapView.current = ctrl;
          }
        }}
        onDataLoaded={({venueData}) => {
          setVenue(venueData);
          setSelectedMapId(mapView.current?.currentMap?.id);
        }}
        onMapChanged={({map}) => {
          setSelectedMapId(map.id);
        }}
        onFirstMapLoaded={() => {
          setLoading(false);
        }}
        onStateChanged={({state}) => {
          setMapState(state);
        }}
        options={options}
        onBlueDotPositionUpdated={({update}) => {
          const nearestNode = update.nearestNode;
          if (nearestNode != null) {
            const primaryLocation = nearestNode.locations[0];
            if (primaryLocation != null) {
              setNearestLocation(primaryLocation);
            }
          }
          if (update.map != null) {
            setCurrentLevel(update.map.name);
          }
        }}
        onNothingClicked={reset}
        onPolygonClicked={({polygon}) => {
          if (appState === APPSTATE.DISTANCE) {
            if (distancePoints[0] == null) {
              setDistancePoints([polygon, null]);
            } else if (distancePoints[1] == null) {
              setDistancePoints([distancePoints[0], polygon]);
            }
          } else {
            setAppState(APPSTATE.PROFILE);
            setSelectedLocation(polygon.locations[0]);
          }
        }}
      />
    </View>
  );
};
