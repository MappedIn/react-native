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
  MappedinCategory,
  MappedinLocation,
  TGetVenueOptions,
} from '@mappedin/react-native-sdk';
import React from 'react';
import {
  Image,
  SafeAreaView,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const venueOptions: TGetVenueOptions = {
  venue: 'mappedin-demo-mall',
  clientId: '5eab30aa91b055001a68e996',
  clientSecret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
};

const CategorySectionList = ({
  categories,
}: {
  categories: MappedinCategory[];
}) => {
  const sections: SectionListData<MappedinLocation>[] = categories.map(
    (c: MappedinCategory) => ({
      title: c.name,
      data: c.locations,
    }),
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<MappedinCategory>;
  }) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>{section.title}</Text>
    </View>
  );

  const renderItem: SectionListRenderItem<MappedinLocation> = ({item}) => (
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
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item: MappedinCategory) => item.id}
    />
  );
};

const ListCategories = () => {
  const [venue, setVenue] = React.useState<Mappedin>(null);

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

  const sortedCategories: MappedinCategory[] = venue.categories.sort(
    (a: MappedinCategory, b: MappedinCategory) => (a.name > b.name ? 1 : -1),
  );

  return (
    <SafeAreaView style={styles.container}>
      <CategorySectionList categories={sortedCategories} />
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
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 24,
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

export default ListCategories;
