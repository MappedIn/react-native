import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import {
  MapView as MappedInView,
  useMap,
  useMapViewEvent as useEvent,
  Marker,
} from "@mappedin/react-native-sdk";

const MapSetup = () => {
  const { mapData, mapView } = useMap();
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  // Specific spaces we want to create markers for
  const [sirenSpace, setSirenSpace] = useState<any>(null);
  const [sbarroSpace, setSbarroSpace] = useState<any>(null);

  // Target for the Urban Planet marker (for position updates)
  const [urbanPlanetTarget, setUrbanPlanetTarget] = useState<any>(null);
  const [urbanPlanetMarker, setUrbanPlanetMarker] = useState<any>(null);

  // State for dynamic marker behaviors
  const [sbarroHtmlVariant, setSbarroHtmlVariant] = useState(0);
  const [sirensAnchorIndex, setSirensAnchorIndex] = useState(0);

  // Reference to the Siren marker for updateState calls
  const [sirenMarker, setSirenMarker] = useState<any>(null);

  const sbarroHtmlOptions = [
    "🍕 Sbarro - Fresh Pizza!",
    "🍝 Sbarro - Italian Delights",
    "🥗 Sbarro - Salads & More",
    "🍕 Sbarro - New York Style",
  ];

  const sirensAnchorOptions: (
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
  )[] = [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  const clickCallback = useCallback(
    (payload: any) => {
      if (payload.markers && payload.markers.length > 0) {
        // Clicked on a marker - show alert with marker ID
        const marker = payload.markers[0];

        console.log("clicked on marker?", marker);
        if (marker.id === urbanPlanetMarker?.id) {
          console.log("clicked on urban planet marker");
          setUrbanPlanetTarget(null);
        }
      } else {
        console.log("clicked", payload.coordinate);
        // Clicked on empty space - update Urban Planet marker target to move to clicked position
        setUrbanPlanetTarget(payload.coordinate);
      }
    },
    [urbanPlanetMarker]
  );
  // Handle map clicks for both marker selection and moving Urban Planet marker
  useEvent("click", clickCallback);

  useEffect(() => {
    if (mapData) {
      // Find specific spaces by name
      const allSpaces = mapData.getByType("space");

      const sirens = allSpaces.find(
        (space: any) =>
          space.name && space.name.toLowerCase().includes("sirens")
      );
      const sbarro = allSpaces.find(
        (space: any) =>
          space.name && space.name.toLowerCase().includes("sbarro")
      );
      const urbanPlanet = allSpaces.find(
        (space: any) =>
          space.name && space.name.toLowerCase().includes("urban planet")
      );

      setSirenSpace(sirens);
      setSbarroSpace(sbarro);
      setUrbanPlanetTarget(urbanPlanet);

      console.log("Found spaces:", { sirens, sbarro, urbanPlanet });
    }
  }, [mapData]);

  // Animation timers for dynamic behaviors
  useEffect(() => {
    // Timer for changing Sbarro HTML content every 2 seconds
    const sbarroTimer = setInterval(() => {
      setSbarroHtmlVariant((prev) => (prev + 1) % sbarroHtmlOptions.length);
    }, 2000);

    // Timer for changing Sirens anchor every second
    const sirensTimer = setInterval(() => {
      setSirensAnchorIndex((prev: number) => {
        const newIndex = (prev + 1) % sirensAnchorOptions.length;

        // Update the marker's anchor using updateState if marker exists
        if (sirenMarker && mapView) {
          mapView.updateState(sirenMarker, {
            placement: sirensAnchorOptions[newIndex],
          });
        }

        return newIndex;
      });
    }, 1000);

    return () => {
      clearInterval(sbarroTimer);
      clearInterval(sirensTimer);
    };
  }, [
    sbarroHtmlOptions.length,
    sirensAnchorOptions.length,
    sirenMarker,
    mapView,
  ]);

  const clearSelection = () => {
    setSelectedMarker(null);
  };

  return (
    <View style={{}}>
      {/* Sirens marker - tests options updates (rank changes) */}
      {sirenSpace && (
        <Marker
          key="sirens-marker"
          target={sirenSpace}
          html={`
            <div style="
              background-color: #E91E63;
              color: white;
              padding: 6px 10px;
              border-radius: 8px;
              font-family: Arial, sans-serif;
              font-size: 11px;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(233, 30, 99, 0.4);
              border: 2px solid white;
              text-align: center;
              cursor: pointer;
              min-width: 70px;
              transition: all 0.3s ease;
            ">
              anchor updates
            </div>
          `}
          options={{
            interactive: true,
            placement: sirensAnchorOptions[sirensAnchorIndex],
            rank: "always-visible",
          }}
          onLoad={(marker: any) => {
            console.log("Sirens marker loaded:", marker);
            setSirenMarker(marker);
          }}
        />
      )}

      {/* Sbarro marker - tests HTML content updates */}
      {sbarroSpace && (
        <Marker
          key="sbarro-marker"
          target={sbarroSpace}
          html={`
            <div style="
              background-color: #FF6B35;
              color: white;
              padding: 6px 10px;
              border-radius: 8px;
              font-family: Arial, sans-serif;
              font-size: 11px;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(255, 107, 53, 0.4);
              border: 2px solid white;
              text-align: center;
              cursor: pointer;
              min-width: 80px;
            ">
              ${sbarroHtmlOptions[sbarroHtmlVariant]}
            </div>
          `}
          options={{
            interactive: true,
            rank: "always-visible",
          }}
          onLoad={(marker) => {
            console.log("Sbarro marker loaded:", marker.id);
          }}
        />
      )}

      {/* Urban Planet marker - moveable marker */}
      {urbanPlanetTarget && (
        <Marker
          key="urban-planet-marker"
          target={urbanPlanetTarget}
          html={`
            <div style=""> 👕 'Urban Planet' </div>
          `}
          options={{
            interactive: true,
            rank: "always-visible",
          }}
          onLoad={(marker) => {
            console.log("Urban Planet marker loaded:", marker);
            setUrbanPlanetMarker(marker);
          }}
        />
      )}
    </View>
  );
};

export default function MarkersExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>📍 Markers</Text>
        <Text style={styles.description}>
          This example showcases various ways to use the Marker component,
          including dynamic updates to content and properties, marker
          repositioning, and handling click events.
        </Text>
      </View>

      <View
        style={styles.mapContainer}
        onTouchStart={() => {
          setScrollEnabled(false);
        }}
        onTouchEnd={() => {
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
            Adding HTML markers tied to map locations
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Dynamically updating marker HTML content (Sbarro marker)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Dynamically updating marker properties like anchor (Sirens marker)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Moving marker to new coordinates on map click (Urban Planet marker)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Handling marker click events to show an alert
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
