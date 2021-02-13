import React, { useContext, useEffect } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import type { IMappedinLocation } from '@mappedin/react-native-sdk';
import { APPSTATE, RootContext } from './app';
import { Picker } from '@react-native-picker/picker';
import { Card } from './card';

enum STATE {
  DIRECTIONS,
  DIRECTIONS_FROM_LOCATION,
}

const LocationsPickerModal = ({
  locations,
  locationIdSelected,
}: {
  locations: IMappedinLocation[];
  locationIdSelected: (id: IMappedinLocation['id']) => void;
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
      }}
    >
      <View style={{ backgroundColor: '#DDD' }}>
        <Picker
          selectedValue={-1}
          mode="dropdown"
          style={{
            alignContent: 'center',
            color: '#333',
            borderRadius: 10,
            borderColor: '#AAA',
          }}
          onValueChange={(locationId) => {
            locationIdSelected(locationId as string);
          }}
        >
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
    setDirections,
    mapView,
  } = useContext(RootContext);

  const [state] = React.useState<STATE>(STATE.DIRECTIONS);
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
        if (departure != null) {
          mapView.current?.setPolygonColor(departure.polygons[0].id, 'red');
        }

        if (destination != null) {
          mapView.current?.setPolygonColor(destination.polygons[0].id, 'red');
        }

        const directions = await mapView.current?.getDirections({
          from: departure!,
          to: destination!,
        });

        console.log(departure, destination)

        if (directions == null || directions.path.length === 0) {
          console.log('Unable to navigate');
          setLoading(false);
          return;
        }

        await mapView.current?.drawJourney(directions, {
          pathOptions: { displayArrowsOnPath: true, nearRadius: 10, farRadius: 30, color: 'green' },
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
          venueData?.maps.find((m) => m.id === directions?.path[0].map)!,
        );
        await mapView.current?.focusOn({
          // @ts-ignore
          nodes: directions.path
            .filter((n) => n.map === directions?.path[0].map)
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
    if (selectedLocation != null) {
      mapView.current?.clearJourney();
    }
  }, [selectedLocation]);

  if (venueData == null) {
    return null;
  }

  return (
    <>
      <Card
        desiredHeight={Dimensions.get('window').height / 5}
        isOpen={state === STATE.DIRECTIONS}
      >
        {directions == null ? (
          <View style={{ display: 'flex', flex: 1 }}>
            <Text style={{ fontSize: 20, alignSelf: 'center' }}>
              Directions
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>Departure:</Text>
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
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>
                    {departure?.name || 'Tap to select'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>Destination:</Text>
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
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>
                    {destination?.name || 'Tap to select'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 16 }}>From: {departure?.name}</Text>
            <Text style={{ fontSize: 16 }}>To: {destination?.name}</Text>

            <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 20 }}>
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
              } as IMappedinLocation,
              nearestLocation != null && {
                id: nearestLocation?.id,
                name: `[Your Location]${nearestLocation?.name}`,
              },
              ...venueData.locations,
            ].filter((x) => x) as IMappedinLocation[]
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
