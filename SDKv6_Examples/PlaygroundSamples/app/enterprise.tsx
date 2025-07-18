import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, ViewStyle } from "react-native";
import { Link } from "expo-router";
import { MapView as MappedInView, useMap } from "@mappedin/react-native-sdk";

export interface MapViewProps {
  style?: ViewStyle;
  mapId?: string;
  onMapReady?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

const MapSetup = () => {
  const { mapData, mapView } = useMap();

  useEffect(() => {
    if (mapData && mapView) {
      console.log("ready for business", mapData.getByType("space")[0].id);
      async function run() {
        mapView.Text3D.labelAll();
        await mapView.StackedMaps.expand({
          distanceBetweenFloors: "auto",
        });
        for (const space of mapData.getByType("space")) {
          await mapView.Camera.focusOn(space, {
            duration: 2000,
            easing: "ease-in-out",
          });
        }
      }
      run();
    }
  }, [mapData, mapView]);
  return <></>;
};

const MapView = ({
  style,
  mapId: venue,
  onMapReady,
  onError,
  children,
}: MapViewProps) => {
  React.useEffect(() => {}, [venue, onMapReady, onError]);

  // See Demo API key Terms and Conditions
  // Demo Key & Maps: https://developer.mappedin.com/docs/demo-keys-and-maps
  return (
    <View style={[mapStyles.container, style]}>
      <MappedInView
        options={{}}
        mapData={{
          key: "5eab30aa91b055001a68e996",
          secret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
          mapId: "mappedin-demo-mall",
        }}
      >
        {children || <MapSetup />}
      </MappedInView>
    </View>
  );
};

MapView.displayName = "MapView";

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default function BasicMapView() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  const handleMapReady = () => {};

  const handleMapError = (error: string) => {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Basic Map View</Text>
        <Text style={styles.description}>
          This example demonstrates loading a Mappedin CMS map, initializing
          stacked maps and automatic space touring with camera animations.
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
        <MapView
          style={styles.map}
          mapId="mappedin-demo-mall"
          onMapReady={handleMapReady}
          onError={handleMapError}
        />
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Initialize Mappedin SDK</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Load venue data display map</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Enable stacked maps.</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Smoothly animate the camera between spaces.
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Display Text3D labels.</Text>
        </View>
      </View>

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Back to Examples</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
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
    color: "#1e3a8a",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
  },
  mapContainer: {
    height: 200,
    marginBottom: 24,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#6b7280",
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
  codePreview: {
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    color: "#d1d5db",
    fontFamily: "monospace",
    lineHeight: 18,
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
