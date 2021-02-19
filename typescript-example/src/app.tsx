import React from 'react';
import {Button, SafeAreaView} from 'react-native';
import type {
  MapViewStore,
  IMappedinLocation,
  IMappedin,
  IMappedinMap,
  TMappedinDirections,
  TMiMapViewOptions,
} from '@mappedin/react-native-sdk';
import {Map} from './map';
import {MapPicker} from './map-picker';
import {useLocation} from './use-my-location';

import {Loading} from './loading';
import {LocationCard} from './location-card';
import {MyLocation} from './my-location';
import {Directions} from './directions-card';

import credentials from './credentials.json';

export enum APPSTATE {
  HOME = 'HOME',
  DIRECTIONS = 'DIRECTIONS',
  PROFILE = 'PROFILE',
}

const useRootContext = () => {
  const [selectedMapId, setSelectedMapId] = React.useState<
    IMappedinMap['id']
  >();
  const [venueData, setVenue] = React.useState<IMappedin>();
  const [
    selectedLocation,
    setSelectedLocation,
  ] = React.useState<IMappedinLocation>();
  const mapView = React.useRef<MapViewStore>();
  const [directions, setDirections] = React.useState<TMappedinDirections>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [
    nearestLocation,
    setNearestLocation,
  ] = React.useState<IMappedinLocation>();
  const [currentLevel, setCurrentLevel] = React.useState<
    IMappedinMap['name']
  >();

  const [appState, setAppState] = React.useState<APPSTATE>(APPSTATE.HOME);
  const [departure, setDeparture] = React.useState<IMappedinLocation>();
  const [destination, setDestination] = React.useState<IMappedinLocation>();
  const [language, setLanguage] = React.useState('en-US');

  const options = React.useRef<TMiMapViewOptions>(credentials);

  return {
    departure,
    setDeparture,
    reset: () => {
      mapView.current?.clearJourney();
      mapView.current?.clearAllPolygonColors();
      setDirections(undefined);
      setDeparture(undefined);
      setDestination(undefined);
      setSelectedLocation(undefined);
      setAppState(APPSTATE.HOME);
    },
    setDestination,
    destination,
    language,
    setLanguage,
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
  departure: IMappedinLocation | undefined;
  setDeparture: React.Dispatch<
    React.SetStateAction<IMappedinLocation | undefined>
  >;
  destination: IMappedinLocation | undefined;
  setDestination: React.Dispatch<
    React.SetStateAction<IMappedinLocation | undefined>
  >;
  setAppState: React.Dispatch<React.SetStateAction<APPSTATE>>;
  nearestLocation: IMappedinLocation | undefined;
  directions: TMappedinDirections | undefined;
  mapView: React.MutableRefObject<MapViewStore | undefined>;
  selectedMapId: string | undefined;
  venueData: IMappedin | undefined;
  selectedLocation: any;
  loading: boolean;
  reset: () => void;
  options: React.MutableRefObject<TMiMapViewOptions>;
  currentLevel: IMappedinMap['name'] | undefined;
  setCurrentLevel: React.Dispatch<
    React.SetStateAction<IMappedinMap['name'] | undefined>
  >;
  setNearestLocation: React.Dispatch<
    React.SetStateAction<IMappedinLocation | undefined>
  >;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDirections: React.Dispatch<
    React.SetStateAction<TMappedinDirections | undefined>
  >;
  setSelectedMapId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setVenue: React.Dispatch<React.SetStateAction<IMappedin | undefined>>;
  setSelectedLocation: React.Dispatch<
    React.SetStateAction<IMappedinLocation | undefined>
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
    language,
    setLanguage,
  } = rootController;

  const {
    enable: enableRealLocation,
    isEnabled: isRealLocationEnabled,
  } = useLocation(rootController);

  return (
    <RootContext.Provider value={rootController}>
      <SafeAreaView style={{flex: 1}}>
        <Map options={rootController.options.current}></Map>

        <MapPicker />
        {appState === APPSTATE.DIRECTIONS && <Directions />}
        {appState === APPSTATE.HOME && (
          <Button
            title="Get Directions"
            onPress={() => {
              setAppState(APPSTATE.DIRECTIONS);
            }}></Button>
        )}
        {!isRealLocationEnabled && !isRealLocationEnabled && (
          <Button
            title="Enable Real Location"
            onPress={() => {
              enableRealLocation();
            }}></Button>
        )}
        <Button
          title={
            language === 'en-US' ? 'Switch to Arabic' : 'Switch to English'
          }
          onPress={() => {
            setLanguage((curLanguage) =>
              curLanguage === 'en-US' ? 'ar-AE' : 'en-US',
            );
          }}></Button>
        <MyLocation />
        {appState === APPSTATE.PROFILE && selectedLocation && <LocationCard />}

        {rootController.loading && <Loading />}
      </SafeAreaView>
    </RootContext.Provider>
  );
};
