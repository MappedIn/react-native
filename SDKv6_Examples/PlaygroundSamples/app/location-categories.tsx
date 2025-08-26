import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import { Mappedin, MapView, useMap } from "@mappedin/react-native-sdk";

interface LocationProfile {
  id: string;
  name: string;
  description?: string;
  images: Array<{ url: string }>;
}

interface LocationCategory {
  id: string;
  name: string;
  icon?: string;
  locationProfiles: LocationProfile[];
}

interface ParentCategory {
  id: string;
  name: string;
  icon?: string;
  children: LocationCategory[];
}

const LocationCategoriesSetup = ({
  onCategoriesLoaded,
}: {
  onCategoriesLoaded: (categories: ParentCategory[]) => void;
}) => {
  const { mapData } = useMap();

  useEffect(() => {
    if (mapData) {
      try {
        const categories = mapData.getByType("location-category");
        onCategoriesLoaded(categories);
      } catch (error) {
        console.error("Error getting location categories:", error);
      }
    }
  }, [mapData, onCategoriesLoaded]);

  return null;
};

const LocationCard = ({ location }: { location: LocationProfile }) => (
  <View style={styles.locationCard}>
    {location.images[0]?.url && (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: location.images[0].url }}
          style={styles.locationImage}
          resizeMode="cover"
        />
      </View>
    )}
    <View style={styles.locationInfo}>
      <Text style={styles.locationName}>{location.name}</Text>
      {location.description && (
        <Text style={styles.locationDescription} numberOfLines={3}>
          {location.description}
        </Text>
      )}
    </View>
  </View>
);

const CategorySection = ({
  parentCategory,
  childCategory,
}: {
  parentCategory: ParentCategory;
  childCategory: LocationCategory;
}) => (
  <View style={styles.categorySection}>
    <View style={styles.titleContainer}>
      {parentCategory.icon && (
        <Image
          source={{ uri: parentCategory.icon }}
          style={styles.categoryIcon}
        />
      )}
      <Text style={styles.parentCategoryName}>{parentCategory.name}</Text>
      <Text style={styles.separator}>→</Text>
      {childCategory.icon && (
        <Image
          source={{ uri: childCategory.icon }}
          style={styles.categoryIcon}
        />
      )}
      <Text style={styles.childCategoryName}>{childCategory.name}</Text>
    </View>

    <FlatList
      data={childCategory.locationProfiles.filter(
        (location) => location.name.length > 0
      )}
      renderItem={({ item }) => <LocationCard location={item} />}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.locationsGrid}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  </View>
);

export default function LocationCategoriesExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const [locationCategories, setLocationCategories] = useState<
    ParentCategory[]
  >([]);

  const handleCategoriesLoaded = (categories: ParentCategory[]) => {
    setLocationCategories(categories);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Location Categories</Text>
        <Text style={styles.description}>
          This example demonstrates how to display location categories and their
          profiles in a grid layout, similar to the Mappedin JS web example. It
          shows parent categories, child categories, and location profiles with
          images and descriptions.
        </Text>
      </View>

      <View
        style={styles.mapContainer}
        onTouchStart={() => {
          console.log("Map touched - disabling scroll");
          setScrollEnabled(false);
        }}
        onTouchEnd={() => {
          console.log("Map touch ended - enabling scroll");
          setScrollEnabled(true);
        }}
      >
        {/* See Demo API key Terms and Conditions
        // Demo Key & Maps: https://developer.mappedin.com/docs/demo-keys-and-maps */}
        <MapView
          style={styles.map}
          mapData={{
            key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
            secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
            mapId: "660c0c6e7c0c4fe5b4cc484c",
          }}
        >
          <LocationCategoriesSetup
            onCategoriesLoaded={handleCategoriesLoaded}
          />
        </MapView>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Location Categories:</Text>

        {locationCategories.length > 0 ? (
          locationCategories
            .filter((parentCategory) => parentCategory.children.length > 0)
            .map((parentCategory) =>
              parentCategory.children.map((childCategory) => (
                <CategorySection
                  key={`${parentCategory.id}-${childCategory.id}`}
                  parentCategory={parentCategory}
                  childCategory={childCategory}
                />
              ))
            )
        ) : (
          <Text style={styles.loadingText}>Loading location categories...</Text>
        )}
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Fetching location categories and profiles from Mappedin data
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Displaying hierarchical category structure (parent → child)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Grid layout for location profiles with images and descriptions
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Category icons and visual hierarchy indicators
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Responsive grid layout that adapts to different screen sizes
          </Text>
        </View>
      </View>

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Back to Examples</Text>
      </Link>
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2; // 2 columns with padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
  },
  mapContainer: {
    height: 300,
    marginBottom: 24,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  categorySection: {
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
    marginBottom: 16,
  },
  categoryIcon: {
    width: 24,
    height: 24,
  },
  parentCategoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  separator: {
    fontSize: 16,
    color: "#999",
    marginHorizontal: 4,
  },
  childCategoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  locationsGrid: {
    justifyContent: "space-between",
  },
  locationCard: {
    width: cardWidth,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    overflow: "hidden",
  },
  locationImage: {
    width: "100%",
    height: "100%",
  },
  locationInfo: {
    padding: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  featuresContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: "#3b82f6",
    marginRight: 8,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    lineHeight: 20,
  },
  link: {
    alignSelf: "center",
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
