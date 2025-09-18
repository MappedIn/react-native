import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import {
  MapView as MappedInView,
  useMap,
  useMapViewEvent as useEvent,
  Marker,
  Path,
} from "@mappedin/react-native-sdk";

const MapSetup = () => {
  const { mapData, mapView } = useMap();
  const [showDirections, setShowDirections] = useState(false);
  const [directions, setDirections] = useState<any>(null);
  const [space1, setSpace1] = useState<any>(null);
  const [space2, setSpace2] = useState<any>(null);
  const [toggleSpace, setToggleSpace] = useState<any>(null);

  // Handle map clicks to potentially update path
  const clickCallback = useCallback((payload: any) => {
    if (payload.markers && payload.markers.length > 0) {
      // Check if clicked marker is our toggle button
      const marker = payload.markers[0];
      console.log("Clicked on marker:", marker.id);

      // Toggle the path when the toggle marker is clicked
      setShowDirections((prev) => !prev);
    } else if (payload.spaces && payload.spaces.length > 0) {
      console.log("Clicked on space:", payload.spaces[0].name);
    } else {
      console.log("Clicked at coordinate:", payload.coordinate);
    }
  }, []);

  useEvent("click", clickCallback);

  useEffect(() => {
    if (mapData && mapView) {
      const allSpaces = mapData.getByType("space");

      // Get the first few spaces for our example
      const firstSpace = allSpaces[0];
      const secondSpace = allSpaces[1];
      const buttonSpace = allSpaces[10]; // Space to put our toggle button

      setSpace1(firstSpace);
      setSpace2(secondSpace);
      setToggleSpace(buttonSpace);

      console.log("Spaces found:", {
        space1: firstSpace?.name,
        space2: secondSpace?.name,
        toggleSpace: buttonSpace?.name,
      });
    }
  }, [mapData, mapView]);

  // Get directions when we have the spaces and want to show the path
  useEffect(() => {
    const getDirections = async () => {
      if (mapView && space1 && space2 && showDirections) {
        try {
          const pathDirections = await mapView.getDirections(space1, space2);
          setDirections(pathDirections);
          if (pathDirections?.path) {
            mapView.Camera.focusOn(pathDirections.path, {
              duration: 1000,
              maxZoomLevel: 19,
            });
          }
          console.log(
            "Directions calculated:",
            pathDirections?.coordinates?.length,
            "coordinates"
          );
        } catch (error) {
          console.warn("Failed to get directions:", error);
          setDirections(null);
        }
      } else {
        setDirections(null);
      }
    };

    getDirections();
  }, [mapView, space1, space2, showDirections]);

  return (
    <View>
      {/* Toggle button marker */}
      {toggleSpace && (
        <Marker
          key="path-toggle-marker"
          target={toggleSpace}
          html={`
            <div style="
              background-color: ${showDirections ? "#FF6B35" : "#007AFF"};
              color: white;
              padding: 10px 16px;
              border-radius: 12px;
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: bold;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              border: 2px solid white;
              text-align: center;
              cursor: pointer;
              min-width: 120px;
              transition: all 0.3s ease;
              transform: scale(1);
            ">
              ${showDirections ? "🚫 Hide Path" : "🛤️ Show Path"}
            </div>
          `}
          options={{
            interactive: true,
            rank: "always-visible",
            placement: "center",
          }}
          onLoad={(marker) => {
            console.log("Toggle marker loaded:", marker.id);
          }}
        />
      )}

      {/* Start point marker */}
      {space1 && showDirections && (
        <Marker
          key="start-marker"
          target={space1}
          html={`
            <div style="
              background-color: #34C759;
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              font-family: Arial, sans-serif;
              font-size: 12px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(52, 199, 89, 0.4);
              border: 2px solid white;
              text-align: center;
            ">
              🚀 Start: ${space1.name || "Space 1"}
            </div>
          `}
          options={{
            interactive: false,
            rank: "always-visible",
          }}
        />
      )}

      {/* End point marker */}
      {space2 && showDirections && (
        <Marker
          key="end-marker"
          target={space2}
          html={`
            <div style="
              background-color: #FF3B30;
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              font-family: Arial, sans-serif;
              font-size: 12px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
              border: 2px solid white;
              text-align: center;
            ">
              🎯 End: ${space2.name || "Space 2"}
            </div>
          `}
          options={{
            interactive: false,
            rank: "always-visible",
          }}
        />
      )}

      {/* The Path component */}
      {directions && showDirections && (
        <Path
          key="navigation-path"
          coordinate={directions.coordinates}
          options={{
            color: "#007AFF",
            width: 1,
            interactive: true,
          }}
          onLoad={(path) => {
            console.log("Path loaded successfully:", path.id);
            console.log("Path coordinates count:", path.coordinates?.length);
          }}
          onDrawComplete={() => {
            console.log("Path drawing animation completed");
          }}
        />
      )}
    </View>
  );
};

export default function PathsExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🛤️ Paths</Text>
        <Text style={styles.description}>
          This example demonstrates how to display navigation paths between
          spaces with interactive controls.
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
        <View
          style={{
            flex: 1,
            backgroundColor: "#f0f8ff",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* See Demo API key Terms and Conditions
          // Demo Key & Maps: https://developer.mappedin.com/docs/demo-keys-and-maps */}
          <MappedInView
            mapData={{
              key: "5eab30aa91b055001a68e996",
              secret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
              mapId: "mappedin-demo-mall",
            }}
          >
            <MapSetup />
          </MappedInView>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Getting directions between two spaces using mapView.getDirections()
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Displaying navigation paths with the Path component
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Customizing path appearance with color and radius options
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Toggling path visibility with interactive markers
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Path animation with onLoad and onDrawComplete callbacks
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Adding start and end point markers for better UX
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
