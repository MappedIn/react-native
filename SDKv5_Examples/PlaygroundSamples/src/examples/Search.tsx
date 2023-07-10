import {
  MappedinLocation,
  MapViewStore,
  MiMapView,
  TGetVenueOptions,
} from '@mappedin/react-native-sdk';
import React from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const SearchResultFlatList = ({
  locations,
  onPress,
}: {
  locations: MappedinLocation[];
  onPress: (location: MappedinLocation[]) => void;
}) => {
  const renderItem: ListRenderItem<MappedinLocation> = ({item}) => (
    <Pressable style={styles.item} onPress={() => onPress(item)}>
      <Text style={styles.name}>{item.name}</Text>
    </Pressable>
  );

  return (
    <FlatList
      data={locations}
      renderItem={renderItem}
      keyExtractor={(item: MappedinLocation) => item.id}
    />
  );
};

const Search = () => {
  const mapView = React.useRef<MapViewStore>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [results, setResults] = React.useState<MappedinLocation[]>([]);

  React.useEffect(() => {
    const generateSearchResults = async () => {
      const searchResults = await mapView?.current?.OfflineSearch.search(
        searchQuery,
      );
      setResults(
        searchResults
          ?.filter(r => r.type === 'MappedinLocation')
          .map(r => r.object as MappedinLocation)
          .filter(l => l.type === 'tenant') || [],
      );
    };
    generateSearchResults();
  }, [searchQuery]);

  const handlePress = async (location: MappedinLocation) => {
    const floor = location.polygons[0].map;

    //Switch to the appropriate floor if it is not currently displayed.
    if (floor.id !== mapView.current?.currentMap?.id) {
      await mapView.current?.setMap(floor);
    }
    mapView.current?.clearAllPolygonColors();
    mapView.current?.setPolygonColor(location.polygons[0], 'red');
    mapView.current?.Camera.focusOn({polygons: location.polygons});
  };

  return (
    <SafeAreaView style={styles.fullSafeAreaView}>
      <View style={styles.searchView}>
        <TextInput
          onChangeText={input => setSearchQuery(input)}
          value={searchQuery}
          style={styles.input}
          placeholder="Search..."
        />
        <SearchResultFlatList locations={results} onPress={handlePress} />
      </View>
      <MiMapView
        style={styles.mapView}
        key="mappedin"
        ref={mapView}
        onFirstMapLoaded={() => {
          setResults(
            mapView.current?.venueData?.locations?.filter(
              (location: MappedinLocation) => location.type === 'tenant',
            ) || [],
          );
        }}
        options={venueOptions}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    padding: 16,
    marginVertical: 4,
  },
  name: {
    fontSize: 16,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  fullSafeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchView: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
});

export default Search;
