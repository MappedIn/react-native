import React, { useEffect, useCallback, useState, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { MapView as MappedInView, useMap } from "@mappedin/react-native-sdk";
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef(0);

  const drawPath = useCallback(
    async (destination: any) => {
      if (!mapData || !mapView) return;
      mapData.getByType("space").forEach((s: Mappedin.Space) => {
        mapView.updateState(s.id, {
          interactive: true,
        });
      });
      const startSpace = mapData
        .getByType("space")
        .find((space: Mappedin.Space) => space.name.includes("Office 103"))!;
      if (!startSpace) {
        console.warn("Could not find Cafeteria space");
        return;
      }

      mapView.Paths.removeAll();
      mapView.Markers.removeAll();

      const directions = await mapView.getDirectionsMultiDestination(
        startSpace,
        destination
      );
      if (!directions) {
        console.warn("Could not get directions");
        return;
      }
      console.log("directions", directions);

      await mapView.Navigation.draw(directions, {
        setMapOnConnectionClick: true,
        pathOptions: {
          drawDuration: 200,
          displayArrowsOnPath: true,
          animateArrowsOnPath: true,
          interactive: true,
        },
        inactivePathOptions: {
          interactive: true,
        },
        createMarkers: {
          departure: {
            template: `
					<div style="
						background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
						color: white;
						padding: 4px 8px;
						border-radius: 8px;
						box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
						font-size: 10px;
						font-weight: 600;
						text-align: center;
						border: 1px solid rgba(255,255,255,0.3);
						min-width: 60px;
						position: relative;
					">
						<div style="font-size: 12px; margin-bottom: 1px;">🚀</div>
						<div style="font-size: 8px; line-height: 1.1;">START</div>
						<div style="
							position: absolute;
							bottom: -3px;
							left: 50%;
							transform: translateX(-50%);
							width: 0;
							height: 0;
							border-left: 3px solid transparent;
							border-right: 3px solid transparent;
							border-top: 3px solid #16a34a;
						"></div>
					</div>
				`,
            options: { rank: "always-visible", interactive: true },
          },
          destination: {
            template: `
					<div style="
						background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
						color: white;
						padding: 4px 8px;
						border-radius: 8px;
						box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
						font-size: 10px;
						font-weight: 600;
						text-align: center;
						border: 1px solid rgba(255,255,255,0.3);
						min-width: 60px;
						position: relative;
					">
						<div style="font-size: 12px; margin-bottom: 1px;">🎯</div>
						<div style="font-size: 8px; line-height: 1.1;">END</div>
						<div style="
							position: absolute;
							bottom: -3px;
							left: 50%;
							transform: translateX(-50%);
							width: 0;
							height: 0;
							border-left: 3px solid transparent;
							border-right: 3px solid transparent;
							border-top: 3px solid #dc2626;
						"></div>
					</div>
				`,
            options: { rank: "always-visible", interactive: true },
          },
          connection: {
            template: `
					<div style="
						background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
						color: white;
						padding: 4px 8px;
						border-radius: 8px;
						box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
						font-size: 10px;
						font-weight: 600;
						text-align: center;
						border: 1px solid rgba(255,255,255,0.3);
						min-width: 60px;
						position: relative;
					">
						<div style="font-size: 12px; margin-bottom: 1px;">
							{{#if instruction.action.connection}}{{instruction.action.connection.type}}{{else}}🔄{{/if}}
						</div>
						<div style="font-size: 8px; line-height: 1.1;">{{instruction.action.type}}</div>
						<div style="
							position: absolute;
							bottom: -3px;
							left: 50%;
							transform: translateX(-50%);
							width: 0;
							height: 0;
							border-left: 3px solid transparent;
							border-right: 3px solid transparent;
							border-top: 3px solid #2563eb;
						"></div>
					</div>
				`,
            options: { rank: "always-visible", interactive: true },
          },
        },
      });
    },
    [mapData, mapView]
  );

  // Set up the interval for cycling through paths
  useEffect(() => {
    if (!mapView) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
    intervalRef.current = setInterval(() => {
      const index = countRef.current++ % 3;
      mapView.Navigation.setActivePathByIndex(index);
      console.log("new active path is", mapView.Navigation.activePath?.id);
    }, 2000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mapView]);

  useEffect(() => {
    console.log({ mapView: !!mapView, mapData: !!mapData });
    if (mapData && mapView) {
      console.log("mapView.currentFloor", mapView.currentFloor.id);
      const to = mapData
        .getByType("space")
        .filter((s: Mappedin.Space) => s.floor.id !== mapView.currentFloor.id)
        .splice(1, 6);
      console.log("to", to[0].floor.id);
      drawPath(to);
    }
  }, [mapData, drawPath, mapView]);

  return null;
};

const DirectionsMapView = React.forwardRef<any, MapViewProps>(
  ({ style, children }, ref) => {
    return (
      <View style={[mapStyles.container, style]}>
        <MappedInView
          options={{}}
          mapData={{
            key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
            secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
            mapId: "64ef49e662fd90fe020bee61",
          }}
        >
          <DirectionsMapSetup />
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

export default function DirectionsMultiDestinationExample() {
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
        <Text style={styles.title}>🧭 Multi-Destination Directions</Text>
        <Text style={styles.description}>
          This example demonstrates how to get directions between multiple
          spaces and display the path with markers.
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
          <Text style={styles.featureBullet}>🗺️</Text>
          <Text style={styles.featureText}>
            Multi-destination pathfinding with active path cycling
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>🚀</Text>
          <Text style={styles.featureText}>
            Markers showing start location and all destinations
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
