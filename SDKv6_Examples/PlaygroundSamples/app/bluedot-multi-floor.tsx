import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import {
  Mappedin,
  MapView as MappedInView,
  useMap,
} from "@mappedin/react-native-sdk";
// @ts-ignore
import positions from "./multi-floor-positions.json";

export interface MapViewProps {
  style?: ViewStyle;
  mapId?: string;
  onMapReady?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

// Assertion test status for BlueDot property caching
type AssertionStatus = "pending" | "success" | "failed";

type AssertionTest = {
  name: string;
  status: AssertionStatus;
  message: string;
};

interface BlueDotMultiFloorSetupProps {
  onAssertionTestUpdate: (
    testName: string,
    status: AssertionStatus,
    message: string
  ) => void;
}

const BlueDotMultiFloorSetup = ({
  onAssertionTestUpdate,
}: BlueDotMultiFloorSetupProps) => {
  const { mapData, mapView } = useMap();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const isNavigatingRef = useRef(false);

  const wait = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const startNavigation = useCallback(async () => {
    if (!mapData || !mapView) {
      Alert.alert("Error", "Map not ready or navigation already in progress");
      return;
    }

    try {
      console.log("true");
      setIsNavigating(true);
      isNavigatingRef.current = true;
      setNavigationStarted(true);
      setCurrentPositionIndex(0);

      onAssertionTestUpdate(
        "Follow Change",
        "pending",
        "Waiting for blue-dot-follow-change event..."
      );
      onAssertionTestUpdate(
        "Position Update",
        "pending",
        "Waiting for blue-dot-position-update event..."
      );
      onAssertionTestUpdate(
        "State Change",
        "pending",
        "Waiting for blue-dot-state-change event..."
      );

      const floors = mapData.getByType("floor");
      if (floors.length === 0) {
        Alert.alert("Error", "No floors found in map data");
        return;
      }

      await mapView.setFloor(floors[0]);

      const startPosition = positions[0];
      const endPosition = positions[positions.length - 1];

      const startingFloor = floors[0];
      const endingFloor = floors[3];
      const startCoordinate = await mapView.createCoordinate({
        latitude: startPosition.latitude,
        longitude: startPosition.longitude,
        floorId: startingFloor.id, // Use first floor
      });

      const endCoordinate = await mapView.createCoordinate({
        latitude: endPosition.latitude,
        longitude: endPosition.longitude,
        floorId: endingFloor.id, // Use second floor if available
      });

      if (!startCoordinate || !endCoordinate) {
        Alert.alert("Error", "Could not create coordinates");
        return;
      }
      console.log("coordinates", startCoordinate, endCoordinate);

      // Get directions
      const directions = await mapView.getDirections(
        startCoordinate,
        endCoordinate
      );
      if (!directions) {
        Alert.alert("Error", "Could not calculate directions");
        return;
      }

      console.log("draw");
      // Draw the navigation path
      await mapView.Navigation.draw(directions, {
        pathOptions: {
          displayArrowsOnPath: true,
          animateArrowsOnPath: false,
          accentColor: "#ffffff",
        },
        markerOptions: {
          departureColor: "#228b22",
          destinationColor: "#ff6347",
        },
      });

      mapView.on(
        "blue-dot-position-update",
        (event: Mappedin.TBlueDotEvents) => {
          const isEqual = mapView.BlueDot.coordinate?.isEqual(event.coordinate);
          console.log("blue-dot-position-update assertion:", isEqual, {
            event: { coordinate: event.coordinate },
            cached: { coordinate: mapView.BlueDot.coordinate },
          });

          // Update assertion status based on coordinate equality check
          if (isEqual) {
            onAssertionTestUpdate(
              "Position Update",
              "success",
              "✅ Position caching works! Event coordinate matches cached coordinate"
            );
          } else {
            onAssertionTestUpdate(
              "Position Update",
              "failed",
              `❌ Position caching failed! Coordinates don't match`
            );
          }
        }
      );

      mapView.on("blue-dot-follow-change", (event: any) => {
        const isEqual = event.following === mapView.BlueDot.following;
        console.log("blue-dot-follow-change assertion:", isEqual, {
          event: { following: event.following },
          cached: { following: mapView.BlueDot.following },
        });

        // Update assertion status based on equality check
        if (isEqual) {
          onAssertionTestUpdate(
            "Follow Change",
            "success",
            "✅ Follow caching works! Event matches cached following value"
          );
        } else {
          onAssertionTestUpdate(
            "Follow Change",
            "failed",
            `❌ Follow caching failed! Event: ${event.following}, Cached: ${mapView.BlueDot.following}`
          );
        }
      });
      mapView.on("blue-dot-state-change", (event: any) => {
        const isEqual = event.state === mapView.BlueDot.state;

        if (isEqual) {
          onAssertionTestUpdate(
            "State Change",
            "success",
            "✅ State caching works! Event matches cached state value"
          );
        } else {
          onAssertionTestUpdate(
            "State Change",
            "failed",
            `❌ State caching failed! Event: ${event.state}, Cached: ${mapView.BlueDot.state}`
          );
        }
      });

      // Enable BlueDot
      await mapView.BlueDot.enable({
        watchDevicePosition: false,
      });

      mapView.BlueDot.follow("position-and-path-direction", {
        zoomLevel: 19,
      });

      // Start position updates
      console.log(
        "Starting BlueDot navigation through",
        positions.length,
        "positions",
        { isNavigating }
      );
      console.log(
        "floor",
        mapData
          .getByType("floor")
          .map((f: any) => ({ id: f.id, name: f.name, elevation: f.elevation }))
      );

      for (let i = 0; i < positions.length; i++) {
        // Check if navigation has been stopped
        if (!isNavigatingRef.current) {
          console.log(
            "Navigation stopped, breaking out of position update loop"
          );
          break;
        }

        await wait(1000);
        const position = positions[i];
        setCurrentPositionIndex(i);

        const floor = i < positions.length / 2 ? startingFloor : endingFloor;
        // Update BlueDot position with proper GeolocationCoordinates format
        await mapView.BlueDot.update({
          latitude: position.latitude,
          longitude: position.longitude,
          heading: Math.random() * 360,
          accuracy: 10 * Math.random(),
          floorOrFloorId: floor,
        });

        console.log(`Updated BlueDot position:`, {
          floorLevel: floor?.elevation, // Switch floors mid-journey
        });
      }

      console.log("BlueDot navigation completed");
      // Only show completion alert if navigation wasn't stopped
      if (isNavigatingRef.current) {
        Alert.alert(
          "Navigation Complete",
          "BlueDot has reached the destination"
        );
      }
    } catch (error) {
      console.error(
        "Navigation error:",
        error,
        "\nStack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      Alert.alert(
        "Navigation Error",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      console.log("false");
      setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  }, [mapData, mapView, isNavigating, onAssertionTestUpdate]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    isNavigatingRef.current = false;
    if (mapView) {
      mapView.BlueDot.disable();
      mapView.Navigation.clear();
    }
    setNavigationStarted(false);
    setCurrentPositionIndex(0);
    // Reset assertion status
    onAssertionTestUpdate(
      "Follow Change",
      "pending",
      "Waiting for blue-dot-follow-change event..."
    );
    onAssertionTestUpdate(
      "Position Update",
      "pending",
      "Waiting for blue-dot-position-update event..."
    );
    onAssertionTestUpdate(
      "State Change",
      "pending",
      "Waiting for blue-dot-state-change event..."
    );
  }, [mapView, onAssertionTestUpdate]);

  return (
    <>
      <View style={controlStyles.container}>
        <View style={controlStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              controlStyles.button,
              controlStyles.startButton,
              isNavigating && controlStyles.buttonDisabled,
            ]}
            onPress={startNavigation}
            disabled={isNavigating}
          >
            <Text style={controlStyles.buttonText}>
              {isNavigating ? "Navigating..." : "Start BlueDot Navigation"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              controlStyles.button,
              controlStyles.stopButton,
              !navigationStarted && controlStyles.buttonDisabled,
            ]}
            onPress={stopNavigation}
            disabled={!navigationStarted}
          >
            <Text style={controlStyles.buttonText}>Stop Navigation</Text>
          </TouchableOpacity>
        </View>

        {isNavigating && (
          <View style={controlStyles.statusContainer}>
            <Text style={controlStyles.statusText}>
              Position: {currentPositionIndex + 1} / {positions.length}
            </Text>
            <View style={controlStyles.progressContainer}>
              <View
                style={[
                  controlStyles.progressBar,
                  {
                    width: `${
                      ((currentPositionIndex + 1) / positions.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </>
  );
};

interface BlueDotMultiFloorMapViewProps extends MapViewProps {
  onAssertionTestUpdate: (
    testName: string,
    status: AssertionStatus,
    message: string
  ) => void;
}

const BlueDotMultiFloorMapView = React.forwardRef<
  any,
  BlueDotMultiFloorMapViewProps
>(({ style, children, onAssertionTestUpdate }, ref) => {
  // See Demo API key Terms and Conditions
  // Demo Key & Maps: https://developer.mappedin.com/docs/demo-keys-and-maps
  return (
    <View style={[mapStyles.container, style]}>
      <MappedInView
        options={{ multiFloorView: { enabled: true } }}
        mapData={{
          key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
          secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
          mapId: "66686f1af06f04000b18b8fa",
        }}
      >
        {children || (
          <BlueDotMultiFloorSetup
            onAssertionTestUpdate={onAssertionTestUpdate}
          />
        )}
      </MappedInView>
    </View>
  );
});

BlueDotMultiFloorMapView.displayName = "BlueDotMultiFloorMapView";

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    overflow: "hidden",
  },
});

const controlStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#007AFF",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  buttonDisabled: {
    backgroundColor: "#8E8E93",
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusContainer: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
});

// Simple assertion test result component
const AssertionTestResult = ({ tests }: { tests: AssertionTest[] }) => {
  const getStatusColor = (status: AssertionStatus) => {
    switch (status) {
      case "success":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "pending":
        return "#8e8e93"; // Mute grey instead of spinner
      default:
        return "#8e8e93";
    }
  };

  return (
    <View style={assertionStyles.container}>
      {tests.map((test) => (
        <View key={test.name} style={assertionStyles.testItem}>
          <Text
            style={[
              assertionStyles.message,
              { color: getStatusColor(test.status) },
            ]}
          >
            {test.message}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Simplified styles for assertion tests
const assertionStyles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testItem: {
    marginVertical: 4,
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default function BlueDotMultiFloorExample() {
  // Assertion test state for BlueDot property caching
  const [assertionTests, setAssertionTests] = useState<AssertionTest[]>([
    {
      name: "Follow Change",
      status: "pending",
      message: "Waiting for blue-dot-follow-change event...",
    },
    {
      name: "Position Update",
      status: "pending",
      message: "Waiting for blue-dot-position-update event...",
    },
    {
      name: "State Change",
      status: "pending",
      message: "Waiting for blue-dot-state-change event...",
    },
  ]);

  const handleMapReady = () => {
    console.log("BlueDot Multi-floor map ready");
  };

  const handleMapError = (error: string) => {
    console.error("BlueDot Multi-floor map error:", error);
  };

  const handleAssertionTestUpdate = (
    testName: string,
    status: AssertionStatus,
    message: string
  ) => {
    setAssertionTests((prevTests) =>
      prevTests.map((test) =>
        test.name === testName ? { ...test, status, message } : test
      )
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔵 BlueDot Multi-floor Navigation</Text>
        <Text style={styles.description}>
          This example demonstrates BlueDot navigation across multiple floors,
          following a predefined path with real-time position updates.
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <BlueDotMultiFloorMapView
          style={styles.map}
          onMapReady={handleMapReady}
          onError={handleMapError}
          onAssertionTestUpdate={handleAssertionTestUpdate}
        />
      </View>

      {/* Assertion Test UI - positioned below map, above features */}
      <AssertionTestResult tests={assertionTests} />

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Multi-floor navigation with BlueDot
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Real-time position updates every second
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Navigation path with departure/destination markers
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Progress tracking through predefined positions
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Floor switching during navigation
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
    color: "#5856D6",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  featuresContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1f2937",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: "#5856D6",
    marginRight: 8,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1f2937",
  },
  instructionsText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  codePreview: {
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#f9fafb",
  },
  codeText: {
    fontSize: 12,
    color: "#d1d5db",
    fontFamily: "monospace",
    lineHeight: 16,
  },
  link: {
    alignSelf: "center",
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: "#5856D6",
    fontWeight: "600",
  },
});
