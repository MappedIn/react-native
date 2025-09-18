import React, { useEffect, useCallback, useState } from "react";
import type { ViewStyle } from "react-native";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  MapView as MappedInView,
  useMap,
  useMapViewEvent,
} from "@mappedin/react-native-sdk";
import type Mappedin from "@mappedin/mappedin-js";

export interface MapViewProps {
  style?: ViewStyle;
  mapId?: string;
  onMapReady?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

const DirectionsMapSetup = () => {
  const { mapData, mapView } = useMap();

  const drawPath = useCallback(
    async (destination: any) => {
      if (!mapData || !mapView) return;
      mapData.getByType("space").forEach((s: Mappedin.Space) => {
        mapView.updateState(s.id, {
          interactive: true,
        });
      });
      const startSpace = mapData.getByType("floor")[0].spaces[0];
      if (!startSpace) {
        console.warn("Could not find Cafeteria space");
        return;
      }

      mapView.Paths.removeAll();
      mapView.Markers.removeAll();
      // mapView.Navigation.clear();
      const directions = await mapView.getDirections(startSpace, destination);
      if (!directions) {
        console.warn("Could not get directions");
        return;
      }

      directions.instructions.forEach(
        (instruction: Mappedin.TDirectionInstruction) => {
          if (!instruction.action.connection) return null;
          const markerTemplate = `
        <div style="
          background: white;
          padding: 2px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-size: 12px;
          max-width: 200px;
          border: 1px solid #007AFF;
        ">
          <strong>${instruction.action.type}</strong>
          ${instruction.action.bearing ? instruction.action.bearing : ""}
          <pre>${
            instruction.action.connection
              ? instruction.action.connection.type
              : ""
          }</pre>
          Go ${Math.round(instruction.distance)} meters
        </div>`;

          let options: Mappedin.TAddMarkerOptions = {};
          options.rank = "always-visible";
          mapView.Markers.add(instruction.coordinate, markerTemplate, options);
        }
      );

      console.log("drawing path", directions.coordinates.length);
      await mapView.Paths.add(directions.coordinates, {
        width: 1,
        color: "#007AFF",
      });
      await mapView.Camera.focusOn(directions.path, {
        duration: 500,
        easing: "ease-in-out",
        maxZoomLevel: 18,
      });
    },
    [mapData, mapView]
  );

  useEffect(() => {
    if (mapData) {
      console.log(
        "elevations",
        mapData.getByType("floor").map((f: Mappedin.Floor) => f.id)
      );

      const startSpace = mapData.getByType("floor")[1].spaces[0];
      console.log("secondFloorSpace", startSpace);
      if (startSpace) {
        drawPath(startSpace);
      }
    }
  }, [mapData, drawPath]);

  useMapViewEvent("click", (event) => {
    if (!mapData) return;
    if (event.spaces && event.spaces.length > 0) {
      const destination = event.spaces[0];
      if (destination) {
        drawPath(destination);
      }
    }
  });

  return null;
};

const DirectionsMapView = React.forwardRef<any, MapViewProps>(
  ({ style, children }, ref) => {
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
          {children || <DirectionsMapSetup />}
        </MappedInView>
      </View>
    );
  }
);

DirectionsMapView.displayName = "DirectionsMapView";

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default function DirectionsExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  const handleMapReady = () => {
    console.log("Directions map ready");
  };

  const handleMapError = (error: string) => {
    console.error("Directions map error:", error);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🧭 Directions</Text>
        <Text style={styles.description}>
          This example demonstrates how to get directions between spaces and
          display the path with markers.
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
        <DirectionsMapView
          style={styles.map}
          onMapReady={handleMapReady}
          onError={handleMapError}
        />
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Find spaces by name (Cafeteria → Art)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Get directions between two points
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Display markers for each instruction
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Draw the path on the map</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Camera focus on path</Text>
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
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  map: {
    flex: 1,
  },
  featuresContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e3a8a",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  codePreview: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 12,
  },
  codeText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  link: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  linkText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
