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
import credentials from './credentials.json';

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

  const options = React.useRef<TMiMapViewOptions>(credentials);

  return {
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

interface IRootContext {
  nearestLocation: IMappedinLocation | undefined;
  directions: TMappedinDirections | undefined;
  mapView: React.MutableRefObject<MapViewStore | undefined>;
  selectedMapId: string | undefined;
  venueData: IMappedin | undefined;
  selectedLocation: any;
  loading: boolean;
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

const App = () => {
  const rootController = useRootContext();

  const {listen} = useLocation();

  const turnOnBlueDot = React.useCallback(() => {
    if (
      rootController.venueData == null ||
      rootController.mapView?.current == null
    ) {
      return;
    }

    rootController.mapView.current.enableBlueDot({
      allowImplicitFloorLevel: true,
    });
    listen((location) => {
      console.log(location);
      rootController.mapView.current!.overrideLocation(location);
    });
  }, [rootController.venueData]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <RootContext.Provider value={rootController}>
        <Map options={rootController.options.current}></Map>
        <MapPicker />
        <Button title="Turn on BlueDot" onPress={turnOnBlueDot}></Button>
        <MyLocation />
        <LocationCard />
        {rootController.loading && <Loading />}
      </RootContext.Provider>
    </SafeAreaView>
  );
};

export default App;
