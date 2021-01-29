import React, {useContext, useEffect} from 'react';
import {
  Text,
  Animated,
  Image,
  View,
  ScrollView,
  Button,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {IMappedinLocation} from '@mappedin/react-native-sdk';
import {RootContext} from './app';
import {MiniMap} from './minimap';

export const LocationCard = () => {
  const {
    selectedLocation,
    setDirections,
    directions,
    options,
    nearestLocation,
    mapView,
    venueData,
  } = useContext(RootContext);

  const height = Dimensions.get('window').height;

  const transformAnimation = React.useRef(new Animated.Value(height));

  const [departure, setDeparture] = React.useState<IMappedinLocation>();

  const slideIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(transformAnimation.current, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(transformAnimation.current, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const slideToDirections = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(transformAnimation.current, {
      toValue: 200,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setDirections(undefined);
    if (selectedLocation == null) {
      slideOut();
    } else {
      slideIn();
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (directions != null) {
      slideToDirections();
    }
  }, [directions]);

  return (
    <Animated.View
      style={[
        {
          height: directions != null ? 350 : 450,
          position: 'absolute',
          backgroundColor: '#CCC',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 10,
          zIndex: 999,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 8,
        },
        {
          transform: [{translateY: transformAnimation.current}],
        },
      ]}>
      {directions == null && (
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={{
                uri:
                  selectedLocation?.logo?.large || venueData?.venue.logo?.large,
              }}
              style={{
                margin: 10,
                height: 100,
                width: 100,
                aspectRatio: 135 / 76,
              }}
              resizeMode="contain"></Image>
            <Text style={{flex: 1, fontWeight: 'bold', fontSize: 20}}>
              {selectedLocation?.name}
            </Text>
          </View>
          <ScrollView>
            <Text style={{fontSize: 16, padding: 10}}>
              {selectedLocation?.description}
            </Text>
          </ScrollView>
        </>
      )}
      {directions == null && <MiniMap />}
      {directions != null ? (
        <View style={{padding: 10}}>
          <Text style={{fontSize: 16}}>From: {departure?.name}</Text>
          <Text style={{fontSize: 16}}>To: {selectedLocation?.name}</Text>

          <Text style={{alignSelf: 'center', fontSize: 20, marginTop: 20}}>
            Distance: {Math.floor(directions.distance)} feet
          </Text>
        </View>
      ) : (
        nearestLocation != null && (
          <Button
            title="Get Directions"
            onPress={async () => {
              try {
                const departure = nearestLocation.clone();
                mapView.current?.removeAllPaths();
                const directions = await mapView.current?.getDirections({
                  from: departure,
                  to: selectedLocation,
                });
                setDirections(directions);
                setDeparture(nearestLocation.clone());

                mapView.current?.setPolygonColor(
                  departure.polygons[0].id,
                  'red',
                );
                // @ts-ignore
                await mapView.current?.drawPath(directions.path, {});
                await mapView.current?.focusOn({
                  // @ts-ignore
                  nodes: directions.path.map((n) => n.id),
                  minZoom: 1000,
                  padding: {
                    top: 0,
                    left: 20,
                    right: 20,
                    bottom: 50,
                  },
                });
              } catch (e) {
                console.error(e);
              }
            }}></Button>
        )
      )}
    </Animated.View>
  );
};
