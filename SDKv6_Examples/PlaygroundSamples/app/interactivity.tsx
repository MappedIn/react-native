import React, { useEffect, useState } from "react";
import type { ViewStyle } from "react-native";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { MapView, useMapViewEvent, useMap } from "@mappedin/react-native-sdk";
import type Mappedin from "@mappedin/mappedin-js";

export interface MapViewProps {
  style?: ViewStyle;
  mapId?: string;
  onMapReady?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

const InteractiveMapSetup = () => {
  const { mapData, mapView } = useMap();

  useEffect(() => {
    const spaces = mapData.getByType("space");
    spaces.forEach((space: Mappedin.Space) => {
      mapView.updateState(space as any, {
        interactive: true,
      });
    });
  }, [mapData, mapView]);

  useMapViewEvent("click", (event) => {
    if (event.spaces?.length) {
      const space = event.spaces[0];

      mapView.updateState(space, {
        color: "red",
      });

      // Focus on the clicked space
      mapView.Camera.focusOn(space, {
        duration: 200,
        easing: "ease-in-out",
        maxZoomLevel: 18,
      });

      // Add a marker to highlight the clicked space
      mapView.Markers.add(space, `<div>${space.name}</div>`, {
        rank: "always-visible",
        interactive: true,
      }).catch((error) => {
        console.error("Error focusing on space:", error);
      });
    }
    if (event.markers?.[0]) {
      mapView.Markers.remove(event.markers[0]);
    }
  });

  return null;
};

export default function UseEventExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Interactivity</Text>
        <Text style={styles.description}>
          This example demonstrates interactive map features using the
          useMapViewEvent hook. Click on spaces to focus the camera, add markers
          with space names, and remove markers by clicking on them.
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
            key: "5eab30aa91b055001a68e996",
            secret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
            mapId: "mappedin-demo-mall",
          }}
        >
          <InteractiveMapSetup />
        </MapView>
      </View>
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Interactive Features:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Listen to map click events on spaces and markers
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Access clicked space information and properties
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Trigger smooth camera animations and focus transitions
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Add dynamic markers with custom HTML content
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Remove markers through click interactions
          </Text>
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
    height: 300,
    marginBottom: 24,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: "#fef3c7",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  instructionBullet: {
    fontSize: 16,
    color: "#f59e0b",
    marginRight: 8,
    fontWeight: "bold",
  },
  instructionText: {
    fontSize: 14,
    color: "#78350f",
    flex: 1,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
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
