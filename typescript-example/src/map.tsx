import React, {useContext, useEffect} from 'react';
import {MiMapView, TMiMapViewOptions} from '@mappedin/react-native-sdk';
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
    reset,
    setMapDimensions,
    setAppState,
    setLoading,
  } = useContext(RootContext);

  useEffect(() => {
    async function setMap() {
      if (directions != null) {
        await mapView.current?.focusOn({
          // @ts-ignore
          nodes: directions.path
            .filter((n) => n.map === selectedMapId)
            .map((n) => n.id),
          minZoom: 1500,
          tilt: 0.1,
          padding: {
            top: 40,
            left: 40,
            right: 40,
            bottom: 250,
          },
        });
      } else if (
        selectedMapId != null &&
        mapView.current?.currentMap?.id !== selectedMapId
      ) {
        if (mapView.current?.currentMap?.id !== selectedMapId) {
          await mapView.current?.setMap(selectedMapId);
        }
        if (directions == null) {
          await mapView.current?.focusOn({
            polygons: venueData?.polygons.filter(
              (p) => p.map === selectedMapId,
            ),
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
        onBlueDotUpdated={({update}) => {
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
          setAppState(APPSTATE.PROFILE);
          mapView.current?.setSafeArea({
            top: 0,
            bottom: 450,
            left: 0,
            right: 0,
          });
          const location = venueData!.locations.find((l) =>
            l.polygons.map((p) => p.id).includes(polygon.id),
          );

          if (location != null) {
            setSelectedLocation(location);
          }
          mapView.current?.clearAllPolygonColors();
          mapView.current?.setPolygonColor(polygon.id, 'red');
          mapView.current!.focusOn({
            polygons: [polygon.id],
            minZoom: 2500,
            tilt: 0.2,
            // changeZoom: false,
            padding: {
              top: 0,
              left: 0,
              right: 0,
              bottom: 450,
            },
          });
        }}
      />
    </View>
  );
};
