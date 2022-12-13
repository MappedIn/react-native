import React from 'react';
import {Button, SafeAreaView} from 'react-native';
import type {
  MapViewStore,
  Mappedin,
  MappedinMap,
  MappedinDirections,
  TMiMapViewOptions,
  MappedinNode,
  MappedinLocation,
  MappedinPolygon,
} from '@mappedin/react-native-sdk';
import {STATE} from '@mappedin/react-native-sdk';
import {Map} from './map';
import {MapPicker} from './map-picker';
import {useLocation} from './use-my-location';

import {Loading} from './loading';
import {LocationCard} from './location-card';
import {MyLocation} from './my-location';
import {Directions} from './directions-card';

import credentials from './credentials.json';
import {DistanceCard} from './distance';

export enum APPSTATE {
  HOME = 'HOME',
  DIRECTIONS = 'DIRECTIONS',
  PROFILE = 'PROFILE',
  DISTANCE = 'DISTANCE',
}

const useRootContext = () => {
  const [selectedMapId, setSelectedMapId] = React.useState<
    MappedinMap['id']
  >();
  const [venueData, setVenue] = React.useState<Mappedin>();
  const [
    selectedLocation,
    setSelectedLocation,
  ] = React.useState<MappedinLocation>();
  const mapView = React.useRef<MapViewStore>();
  const [directions, setDirections] = React.useState<MappedinDirections>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [
    nearestLocation,
    setNearestLocation,
  ] = React.useState<MappedinLocation>();
  const [currentLevel, setCurrentLevel] = React.useState<
    MappedinMap['name']
  >();

  const [appState, setAppState] = React.useState<APPSTATE>(APPSTATE.HOME);
  const [departure, setDeparture] = React.useState<
    MappedinLocation | MappedinNode
  >();
  const [destination, setDestination] = React.useState<
    MappedinLocation | MappedinNode
  >();
  const [mapState, setMapState] = React.useState<STATE>(STATE.EXPLORE);
  const [mapDimensions, setMapDimensions] = React.useState({
    width: 0,
    height: 0,
  });
  const [distancePoints, setDistancePoints] = React.useState<
    [MappedinPolygon | null, MappedinPolygon | null]
  >([null, null]);

  const options = React.useRef<TMiMapViewOptions>(credentials);

  return {
    departure,
    setDeparture,
    distancePoints,
    setDistancePoints,
    reset: () => {
      mapView.current?.clearJourney();
      mapView.current?.clearAllPolygonColors();
      setDirections(undefined);
      setDeparture(undefined);
      setDestination(undefined);
      setSelectedLocation(undefined);
      setAppState(APPSTATE.HOME);
    },
    mapDimensions,
    setMapDimensions,
    setDestination,
    destination,
    appState,
    setAppState,
    currentLevel,
    setCurrentLevel,
    loading,
    options,
    setLoading,
    directions,
    setDirections,
    mapView,
    mapState,
    setMapState,
    selectedMapId,
    venueData,
    selectedLocation,
    nearestLocation,
    setNearestLocation,
    setSelectedMapId,
    setVenue,
    setSelectedLocation,
  };
};

export interface IRootContext {
  appState: APPSTATE;
  departure: MappedinLocation | MappedinNode | undefined;
  setDeparture: React.Dispatch<
    React.SetStateAction<MappedinLocation | MappedinNode | undefined>
  >;
  distancePoints: [MappedinPolygon | null, MappedinPolygon | null];
  setDistancePoints: React.Dispatch<
    React.SetStateAction<[MappedinPolygon | null, MappedinPolygon | null]>
  >;
  destination: MappedinLocation | MappedinNode | undefined;
  setDestination: React.Dispatch<
    React.SetStateAction<MappedinLocation | MappedinNode | undefined>
  >;
  setAppState: React.Dispatch<React.SetStateAction<APPSTATE>>;
  nearestLocation: MappedinLocation | undefined;
  directions: MappedinDirections | undefined;
  mapView: React.MutableRefObject<MapViewStore | undefined>;
  selectedMapId: string | undefined;
  venueData: Mappedin | undefined;
  selectedLocation: MappedinLocation | undefined;
  loading: boolean;
  reset: () => void;
  mapDimensions: {width: number; height: number};
  setMapDimensions: React.Dispatch<
    React.SetStateAction<{width: number; height: number}>
  >;
  mapState: STATE;
  setMapState: React.Dispatch<React.SetStateAction<STATE>>;
  options: React.MutableRefObject<TMiMapViewOptions>;
  currentLevel: MappedinMap['name'] | undefined;
  setCurrentLevel: React.Dispatch<
    React.SetStateAction<MappedinMap['name'] | undefined>
  >;
  setNearestLocation: React.Dispatch<
    React.SetStateAction<MappedinLocation | undefined>
  >;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDirections: React.Dispatch<
    React.SetStateAction<MappedinDirections | undefined>
  >;
  setSelectedMapId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setVenue: React.Dispatch<React.SetStateAction<Mappedin | undefined>>;
  setSelectedLocation: React.Dispatch<
    React.SetStateAction<MappedinLocation | undefined>
  >;
}

export const RootContext = React.createContext<IRootContext>(
  {} as IRootContext,
);

export const App = () => {
  const rootController = useRootContext();
  const {
    setAppState,
    appState,
    selectedLocation,
    mapView,
    mapState,
  } = rootController;

  const {enable, isEnabled} = useLocation(rootController);

  const DistanceButton = (
    <Button
      title="Get Distance"
      onPress={() => {
        setAppState(APPSTATE.DISTANCE);
      }}></Button>
  );

  const DirectionsButton = (
    <Button
      title="Get Directions"
      onPress={() => {
        setAppState(APPSTATE.DIRECTIONS);
      }}></Button>
  );

  const FollowExploreButton = (
    <Button
      title={
        mapState === STATE.EXPLORE
          ? 'Enable follow mode'
          : 'Disable Follow Mode'
      }
      onPress={() => {
        mapView.current?.setState(
          mapState === STATE.EXPLORE ? STATE.FOLLOW : STATE.EXPLORE,
        );
      }}></Button>
  );

  const EnableLocationButton = !isEnabled && (
    <Button
      title="Enable Real Location"
      onPress={() => {
        enable();
      }}></Button>
  );

  /**
   * Convenient way to configure what buttons to show depending on current app state
   */
  const whatButtonsToDisplay: {
    [key in APPSTATE]?: React.ReactNode[];
  } = {
    [APPSTATE.HOME]: [
      DistanceButton,
      DirectionsButton,
      FollowExploreButton,
      EnableLocationButton,
    ],
  };

  return (
    <RootContext.Provider value={rootController}>
      <SafeAreaView style={{flex: 1}}>
        <Map options={rootController.options.current}></Map>

        <MapPicker />
        {appState === APPSTATE.DIRECTIONS && <Directions />}
        <MyLocation />
        {appState === APPSTATE.PROFILE && selectedLocation && <LocationCard />}
        {appState === APPSTATE.DISTANCE && <DistanceCard />}
        <>
          {(Object.keys(whatButtonsToDisplay) as APPSTATE[])
            .filter((state) => state === appState)
            .map((state) => whatButtonsToDisplay[state])}
        </>
        {rootController.loading && <Loading />}
      </SafeAreaView>
    </RootContext.Provider>
  );
};
