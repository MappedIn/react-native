import React, { useContext } from 'react';
import { MiMapView } from '@mappedin/react-native-sdk';
import type { TMiMapViewOptions } from '@mappedin/react-native-sdk';
import { RootContext } from './app';

export const Map = ({ options }: { options: TMiMapViewOptions }) => {
  const {
    mapView,
    setVenue,
    setSelectedMapId,
    setCurrentLevel,
    setSelectedLocation,
    setNearestLocation,
    venueData,
    setLoading,
  } = useContext(RootContext);

  return (
    <MiMapView
      style={{ flex: 1 }}
      key="mappedin"
      ref={(ctrl) => {
        if (ctrl != null) {
          mapView.current = ctrl;
        }
      }}
      onDataLoaded={({ venueData }) => {
        setVenue(venueData);
        setSelectedMapId(mapView.current?.currentMap?.id);
      }}
      onFirstMapLoaded={() => {
        setLoading(false);
      }}
      options={options}
      onBlueDotUpdated={({ update }) => {
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
      onNothingClicked={() => {
        setSelectedLocation(undefined);
        mapView.current?.removeAllPaths();
        mapView.current?.focusOn({});
        mapView.current?.clearAllPolygonColors();
      }}
      onPolygonClicked={({ polygon }) => {
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
  );
};
