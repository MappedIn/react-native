import React, {useContext, useEffect} from 'react';
import {Button, Dimensions, Text, TouchableOpacity, View} from 'react-native';
import {
  MappedinDirections,
  MappedinLocation,
  MappedinNode,
} from '@mappedin/react-native-sdk';
import {APPSTATE, RootContext} from './app';
import {Picker} from '@react-native-picker/picker';
import {Card} from './card';
import * as Svg from 'react-native-svg';

enum STATE {
  DIRECTIONS,
  DIRECTIONS_SET_FROM_MAP,
}

const LocationsPickerModal = ({
  locations,
  locationIdSelected,
}: {
  locations: MappedinLocation[];
  locationIdSelected: (id: string) => void;
}) => {
  if (locations == null || locations.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: 0,
        bottom: 0,
        alignContent: 'center',
        justifyContent: 'center',
      }}>
      <View style={{backgroundColor: '#DDD'}}>
        <Picker
          selectedValue={'-1'}
          mode="dropdown"
          style={{
            alignContent: 'center',
            color: '#333',
            borderRadius: 10,
            borderColor: '#AAA',
          }}
          onValueChange={(locationId) => {
            locationIdSelected(locationId);
          }}>
          {locations.map((l) => (
            <Picker.Item key={l.id} label={l.name} value={l.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

enum FIELD {
  DEPARTURE,
  DESTINATION,
}

export const Directions = () => {
  const {
    setLoading,
    appState,
    venueData,
    departure,
    setDeparture,
    destination,
    nearestLocation,
    selectedLocation,
    setDestination,
    directions,
    selectedMapId,
    mapDimensions,
    setDirections,
    mapView,
  } = useContext(RootContext);

  const [state, setState] = React.useState<STATE>(STATE.DIRECTIONS);
  const [editing, setEditing] = React.useState<FIELD>();

  if (
    venueData?.locations == null ||
    (Array.isArray(venueData?.locations) && venueData?.locations.length === 0)
  ) {
    return null;
  }

  useEffect(() => {
    async function getDirections() {
      if (
        departure != null &&
        destination != null &&
        appState === APPSTATE.DIRECTIONS
      ) {
        const directions = await mapView.current?.getDirections({
          from: departure!,
          to: destination!,
        }) as MappedinDirections;

        if (directions == null || directions.path.length === 0) {
          console.log('Unable to navigate');
          setLoading(false);
          return;
        }

        const startMap = directions.path[0].map;

        await mapView.current?.Journey.draw(directions, {
          pathOptions: {
            displayArrowsOnPath: true,
            color: 'green',
          },
        });
        // , {
        // connectionTemplateString: `
        // <div
        //   style="
        //     font-size: 13px;
        //     display: flex;
        //     align-items: center;
        //     justify-content: center">
        //   <div style="margin: 10px">
        //     {{capitalize type}} {{#if isEntering}}to{{else}}from{{/if}} {{toMapName}}</div>
        //   <div style="width: 40px;
        //     height: 40px;
        //     border-radius: 50%;
        //     background: green;
        //     display: flex;
        //     align-items: center;
        //     margin: 5px;
        //     margin-left: 0px;
        //     justify-content: center;">
        //     <svg
        //       height="16"
        //       viewBox="0 0 36 36"
        //       width="16"
        //     >
        //       <g fill="white">
        //         {{{icon}}}
        //       </g>
        //     </svg>
        //   </div>
        // </div>`,
        // });
        await mapView.current?.setMap(
          venueData?.maps.find((m) => m.id === startMap)!,
        );
        await mapView.current?.focusOn({
          // @ts-ignore
          nodes: directions.path
            .filter((n) => n.map === startMap)
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
        setDirections(directions);

        setLoading(false);
      }
    }
    getDirections();
  }, [departure, destination, appState]);

  useEffect(() => {
    if (departure instanceof MappedinNode) {
    } else if (departure instanceof MappedinLocation) {
      mapView.current?.setPolygonColor(departure.polygons[0].id, 'red');
    }

    if (destination instanceof MappedinNode) {
    } else if (destination instanceof MappedinLocation) {
      mapView.current?.setPolygonColor(destination.polygons[0].id, 'red');
    }
  }, [departure, destination]);

  useEffect(() => {
    if (selectedLocation != null) {
      mapView.current?.clearJourney();
    }
  }, [selectedLocation]);

  if (venueData == null) {
    return null;
  }

  return (
    <>
      {state === STATE.DIRECTIONS_SET_FROM_MAP && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 50,
              width: '100%',
              zIndex: 999,
            }}>
            <Text style={{fontSize: 22, alignSelf: 'center'}}>
              Select point on map
            </Text>
          </View>
          <View
            style={{
              position: 'absolute',
              top: mapDimensions.height / 2 - 16,
              left: mapDimensions.width / 2 - 16,
            }}>
            <Svg.Svg height={32} viewBox="-96 0 464 464" width={32}>
              <Svg.Path
                d="m120 160h32v256c0 8.835938-7.164062 16-16 16s-16-7.164062-16-16zm0 0"
                fill="#494342"
              />
              <Svg.Path
                d="m232 96c0 53.019531-42.980469 96-96 96s-96-42.980469-96-96 42.980469-96 96-96 96 42.980469 96 96zm0 0"
                fill="#ad2943"
              />
              <Svg.Path
                d="m200 96c0 35.347656-28.652344 64-64 64s-64-28.652344-64-64 28.652344-64 64-64 64 28.652344 64 64zm0 0"
                fill="#ee3446"
              />
            </Svg.Svg>
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignContent: 'center',
              justifyContent: 'center',
            }}>
            <Button
              title="Confirm"
              onPress={async () => {
                const node = await mapView.current?.getNearestNodeByScreenCoordinates(
                  mapDimensions.width / 2,
                  mapDimensions.height / 2 - 16,
                  venueData.maps.find((m) => m.id === selectedMapId)!,
                );
                if (node != null) {
                  console.log(node.id);
                  if (editing === FIELD.DEPARTURE) {
                    setDeparture(node.locations?.[0] || node);
                  } else if (editing === FIELD.DESTINATION) {
                    setDestination(node.locations?.[0] || node);
                  }
                  setEditing(undefined);
                  setState(STATE.DIRECTIONS);
                }
              }}></Button>
            <Button
              title="Cancel"
              onPress={async () => {
                setState(STATE.DIRECTIONS);
              }}></Button>
          </View>
        </>
      )}
      <Card
        desiredHeight={mapDimensions.height / 5}
        isOpen={state === STATE.DIRECTIONS}>
        {directions == null ? (
          <View style={{display: 'flex', flex: 1}}>
            <Text style={{fontSize: 20, alignSelf: 'center'}}>Directions</Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 18}}>Departure:</Text>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#AAA',
                  height: '100%',
                  margin: 5,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setEditing(FIELD.DEPARTURE);
                }}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text style={{fontSize: 18}}>
                    {departure instanceof MappedinLocation
                      ? departure?.name
                      : departure?.id || 'Tap to select'}
                  </Text>
                </View>
              </TouchableOpacity>
              <Button
                title="Set From Map"
                onPress={() => {
                  setEditing(FIELD.DEPARTURE);
                  setState(STATE.DIRECTIONS_SET_FROM_MAP);
                }}
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 18}}>Destination:</Text>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#AAA',
                  height: '100%',
                  margin: 5,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setEditing(FIELD.DESTINATION);
                }}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text style={{fontSize: 18}}>
                    {destination instanceof MappedinLocation
                      ? destination?.name
                      : destination?.id || 'Tap to select'}
                  </Text>
                </View>
              </TouchableOpacity>
              <Button
                title="Set From Map"
                onPress={() => {
                  setEditing(FIELD.DESTINATION);
                  setState(STATE.DIRECTIONS_SET_FROM_MAP);
                }}
              />
            </View>
          </View>
        ) : (
          <View style={{padding: 10}}>
            <Text style={{fontSize: 16}}>
              From:{' '}
              {departure instanceof MappedinLocation
                ? departure?.name
                : departure?.id}
            </Text>
            <Text style={{fontSize: 16}}>
              To:{' '}
              {destination instanceof MappedinLocation
                ? destination?.name
                : destination?.id}
            </Text>

            <Text style={{alignSelf: 'center', fontSize: 20, marginTop: 20}}>
              Distance: {Math.floor(directions.distance)} feet
            </Text>
          </View>
        )}
      </Card>
      {editing != null && state === STATE.DIRECTIONS && (
        <LocationsPickerModal
          locations={
            [
              {
                id: '-1',
                name: 'Please select a location',
              } as MappedinLocation,
              nearestLocation != null && {
                id: nearestLocation?.id,
                name: `[Your Location]${nearestLocation?.name}`,
              },
              ...venueData.locations,
            ].filter((x) => x) as MappedinLocation[]
          }
          locationIdSelected={(locationId) => {
            if (editing === FIELD.DEPARTURE) {
              setDeparture(
                venueData.locations.find((l) => l.id === locationId)?.clone(),
              );
            } else if (editing === FIELD.DESTINATION) {
              setDestination(
                venueData.locations.find((l) => l.id === locationId)?.clone(),
              );
            }
            setEditing(undefined);
          }}
        />
      )}
    </>
  );
};
