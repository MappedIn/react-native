/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {
  getVenue,
  Mappedin,
  MappedinLocation,
  TGetVenueOptions,
} from '@mappedin/react-native-sdk';
import React from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const LocationFlatList = ({locations}: {locations: MappedinLocation[]}) => {
  const renderItem: ListRenderItem<MappedinLocation> = ({item}) => (
    <View style={styles.item}>
      {item.logo?.small && (
        <Image style={styles.itemImage} source={{uri: item.logo?.small}} />
      )}
      <View style={styles.itemText}>
        <Text style={styles.title}>{item.name}</Text>
        <Text numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={locations}
      renderItem={renderItem}
      keyExtractor={(item: MappedinLocation) => item.id}
    />
  );
};

const LocationList = () => {
  const [venue, setVenue] = React.useState<Mappedin>();

  React.useEffect(() => {
    async function init() {
      const venueData = await getVenue(venueOptions);
      setVenue(venueData);
    }
    init();
  }, []);

  if (!venue) {
    return (
      <View style={styles.loading}>
        <Text>Loading venue</Text>
      </View>
    );
  }

  const filteredLocations = venue.locations.filter(
    (l: MappedinLocation) =>
      l.type === 'tenant' && l.description && l.logo?.small,
  );
  filteredLocations.sort((a: MappedinLocation, b: MappedinLocation) =>
    a.name > b.name ? 1 : -1,
  );

  return (
    <SafeAreaView style={styles.container}>
      <LocationFlatList locations={filteredLocations} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemImage: {
    marginRight: 16,
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  itemText: {
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#282828',
    flexShrink: 1,
  },
  container: {},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationList;
