import {
  MappedinCategory,
  MappedinLocation,
  MapViewStore,
  MiMapView,
  TGetVenueOptions,
} from '@mappedin/react-native-sdk';
import {Picker} from '@react-native-picker/picker';
import React, {useRef, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

// See Trial API key Terms and Conditions
// https://developer.mappedin.com/api-keys/
const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const icon = `<svg width="92" height="92" viewBox="-17 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
            <path d="M53.99 28.0973H44.3274C41.8873 28.0973 40.7161 29.1789 40.7161 31.5387V61.1837L21.0491 30.7029C19.6827 28.5889 18.8042 28.1956 16.0714 28.0973H6.5551C4.01742 28.0973 2.84619 29.1789 2.84619 31.5387V87.8299C2.84619 90.1897 4.01742 91.2712 6.5551 91.2712H16.2178C18.7554 91.2712 19.9267 90.1897 19.9267 87.8299V58.3323L39.6912 88.6656C41.1553 90.878 41.9361 91.2712 44.669 91.2712H54.0388C56.5765 91.2712 57.7477 90.1897 57.7477 87.8299V31.5387C57.6501 29.1789 56.4789 28.0973 53.99 28.0973Z" fill="white"/>
            <path d="M11.3863 21.7061C17.2618 21.7061 22.025 16.9078 22.025 10.9887C22.025 5.06961 17.2618 0.27124 11.3863 0.27124C5.51067 0.27124 0.747559 5.06961 0.747559 10.9887C0.747559 16.9078 5.51067 21.7061 11.3863 21.7061Z" fill="white"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="57" height="91" fill="white" transform="translate(0.747559 0.27124)"/>
            </clipPath>
            </defs>
            </svg>`;

const colors = ['dodgerblue', 'pink', 'green', 'orange', 'tomato', 'gray'];

const labelTypes = [
  'Default Floating Labels',
  'Custom Floating Labels',
  'Default Flat Labels',
  'Custom Flat Labels',
];

const Labels = () => {
  const mapView = useRef<MapViewStore>(null);
  const [selectedLabelType, setSelectedLabelType] = useState<string>(
    labelTypes[0],
  );

  const LabelPicker = () => {
    return (
      <Picker
        mode="dropdown"
        selectedValue={selectedLabelType}
        onValueChange={async labelType => {
          setSelectedLabelType(labelType);

          switch (labelType) {
            case labelTypes[0]:
              mapView.current?.FlatLabels.removeAll();
              mapView.current?.FloatingLabels.removeAll();
              mapView.current?.FloatingLabels.labelAllLocations();
              break;
            case labelTypes[1]:
              mapView.current?.FlatLabels.removeAll();
              mapView.current?.FloatingLabels.removeAll();
              mapView.current?.venueData?.categories.forEach(
                (category: MappedinCategory, index: number) => {
                  category.locations.forEach((location: MappedinLocation) => {
                    if (location.polygons.length <= 0) {
                      return;
                    }
                    const color = colors[index % colors.length];
                    mapView.current?.FloatingLabels.add(
                      location.polygons[0],
                      location.name,
                      {
                        appearance: {
                          marker: {
                            icon: icon,
                            foregroundColor: {
                              active: color,
                              inactive: color,
                            },
                          },
                        },
                      },
                    );
                  });
                },
              );
              break;
            case labelTypes[2]:
              mapView.current?.FlatLabels.removeAll();
              mapView.current?.FloatingLabels.removeAll();
              mapView.current?.FlatLabels.labelAllLocations();
              break;
            case labelTypes[3]:
              mapView.current?.FlatLabels.removeAll();
              mapView.current?.FloatingLabels.removeAll();
              mapView.current?.FlatLabels.labelAllLocations({
                appearance: {
                  font: 'Georgia',
                  fontSize: 14,
                  color: '#1c1c43',
                },
              });
              break;
            default:
              break;
          }
        }}>
        {labelTypes.map((labelType, index) => (
          <Picker.Item key={index} label={labelType} value={labelType} />
        ))}
      </Picker>
    );
  };

  return (
    <SafeAreaView style={styles.fullSafeAreaView}>
      <LabelPicker />
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        options={venueOptions}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullSafeAreaView: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
});

export default Labels;
