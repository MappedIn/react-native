import React, { useEffect, useCallback, useRef } from "react";
import type { ViewStyle } from "react-native";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { MapView as MappedInView } from "@mappedin/react-native-sdk";
import {
  useDynamicFocus,
  useDynamicFocusEvent,
} from "@mappedin/dynamic-focus/rn";

// Test status type
type TestStatus = "idle" | "running" | "passed" | "failed";

interface TestResult {
  status: TestStatus;
  message: string;
  expected: { indoorZoomThreshold: number; outdoorZoomThreshold: number };
  actual: {
    indoorZoomThreshold?: number;
    outdoorZoomThreshold?: number;
  } | null;
}

interface EventTestResult {
  status: TestStatus;
  message: string;
  eventReceived: boolean;
  eventData?: any;
}

export interface MapViewProps {
  style?: ViewStyle;
  mapId?: string;
  onMapReady?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export interface MapViewRef {
  getDirections: (from: any, to: any) => Promise<any>;
  addMarkers: (markers: any[]) => void;
  showRoute: (route: any) => void;
  clearMap: () => void;
}

interface MapSetupProps {
  onTestUpdate: (result: TestResult) => void;
  onEventTestUpdate: (result: EventTestResult) => void;
}

const MapSetup: React.FC<MapSetupProps> = ({
  onTestUpdate,
  onEventTestUpdate,
}) => {
  const { updateState, getState, isReady, enable } = useDynamicFocus();

  const [eventTestStarted, setEventTestStarted] = React.useState(false);
  const eventTimeoutRef = React.useRef<number | null>(null);

  useDynamicFocusEvent("focus", (event) => {
    // Mark the event test as passed when the callback is triggered
    if (eventTestStarted) {
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = null;
      }
      onEventTestUpdate({
        status: "passed",
        message: "✅ Event callback test passed!",
        eventReceived: true,
        eventData: event,
      });
    }
  });

  /**
   * Runs the end-to-end test to validate updateState and getState consistency
   */
  const runEndToEndTest = useCallback(async () => {
    const expectedValues = {
      indoorZoomThreshold: 17.5,
      outdoorZoomThreshold: 17,
    };

    onTestUpdate({
      status: "running",
      message: "Testing improved hook API with automatic registration...",
      expected: expectedValues,
      actual: null,
    });

    try {
      await enable({
        autoFocus: true,
        mode: "lock-elevation",
      });
      // Update the state with specific values
      await updateState(expectedValues);

      // Give a small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the state to verify it matches
      const actualState = await getState();

      const actualValues = {
        indoorZoomThreshold: actualState.indoorZoomThreshold,
        outdoorZoomThreshold: actualState.outdoorZoomThreshold,
      };

      // Check if values match
      const indoorMatch =
        actualValues.indoorZoomThreshold === expectedValues.indoorZoomThreshold;
      const outdoorMatch =
        actualValues.outdoorZoomThreshold ===
        expectedValues.outdoorZoomThreshold;

      if (indoorMatch && outdoorMatch) {
        onTestUpdate({
          status: "passed",
          message:
            "✅ Test passed! Hook API is working correctly with automatic registration.",
          expected: expectedValues,
          actual: actualValues,
        });
      } else {
        onTestUpdate({
          status: "failed",
          message: "❌ Test failed! Values do not match.",
          expected: expectedValues,
          actual: actualValues,
        });
      }

      // if (mapData) {
      // 	console.log('set floor');
      // 	mapView.setFloor(mapData.getByType('floor')[5]);
      // }
    } catch (error) {
      onTestUpdate({
        status: "failed",
        message: `❌ Test failed with error: ${error}`,
        expected: expectedValues,
        actual: null,
      });
    }
  }, [updateState, getState, onTestUpdate, enable]);

  const startEventTest = useCallback(() => {
    if (!eventTestStarted) {
      setEventTestStarted(true);

      onEventTestUpdate({
        status: "running",
        message:
          "Waiting for focus events... Try zooming and panning the map to trigger focus events.",
        eventReceived: false,
      });

      // Set a timeout to fail the test if no event is received
      eventTimeoutRef.current = setTimeout(() => {
        onEventTestUpdate({
          status: "failed",
          message:
            "❌ Event callback test failed! No focus events received within 30 seconds.",
          eventReceived: false,
        });
      }, 30000);
    }
  }, [eventTestStarted, onEventTestUpdate]);

  const ran = useRef(false);
  useEffect(() => {
    if (isReady && !ran.current) {
      // Start both tests when the map is ready
      runEndToEndTest();
      startEventTest();
      ran.current = true;
    }
  }, [isReady, runEndToEndTest, startEventTest]);

  return null;
};

const MapView = React.forwardRef<MapViewRef, MapViewProps>(
  ({ style, mapId: venue, onMapReady, onError, children }, ref) => {
    return (
      <View style={[mapStyles.container, style]}>
        <MappedInView
          options={{}}
          mapData={{
            key: "5eab30aa91b055001a68e996",
            secret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
            mapId: "mappedin-demo-campus",
          }}
        >
          {children}
        </MappedInView>
      </View>
    );
  }
);

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

/**
 * Event test status indicator component
 */
const EventTestStatusIndicator: React.FC<{ testResult: EventTestResult }> = ({
  testResult,
}) => {
  const getStatusIcon = () => {
    switch (testResult.status) {
      case "running":
        return <ActivityIndicator size="small" color="#3b82f6" />;
      case "passed":
        return <Text style={testStyles.passIcon}>✅</Text>;
      case "failed":
        return <Text style={testStyles.failIcon}>❌</Text>;
      default:
        return <Text style={testStyles.idleIcon}>⏱️</Text>;
    }
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case "running":
        return "#3b82f6";
      case "passed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={[testStyles.container, { borderLeftColor: getStatusColor() }]}>
      <View style={testStyles.header}>
        <View style={testStyles.statusRow}>
          {getStatusIcon()}
          <Text style={[testStyles.title, { color: getStatusColor() }]}>
            Event Callback Test Status
          </Text>
        </View>
      </View>

      <Text style={testStyles.message}>{testResult.message}</Text>

      {testResult.eventReceived && testResult.eventData && (
        <View style={testStyles.valuesContainer}>
          <View style={testStyles.valueRow}>
            <Text style={testStyles.valueLabel}>Event Received:</Text>
            <Text style={[testStyles.actualValue, { color: "#10b981" }]}>
              {testResult.eventReceived ? "Yes" : "No"}
            </Text>
          </View>
          <View style={testStyles.valueRow}>
            <Text style={testStyles.valueLabel}>Focused Facades Count:</Text>
            <Text style={[testStyles.actualValue, { color: "#10b981" }]}>
              {testResult.eventData.facades?.length || 0}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * Test status indicator component
 */
const TestStatusIndicator: React.FC<{ testResult: TestResult }> = ({
  testResult,
}) => {
  const getStatusIcon = () => {
    switch (testResult.status) {
      case "running":
        return <ActivityIndicator size="small" color="#3b82f6" />;
      case "passed":
        return <Text style={testStyles.passIcon}>✅</Text>;
      case "failed":
        return <Text style={testStyles.failIcon}>❌</Text>;
      default:
        return <Text style={testStyles.idleIcon}>⏱️</Text>;
    }
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case "running":
        return "#3b82f6";
      case "passed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={[testStyles.container, { borderLeftColor: getStatusColor() }]}>
      <View style={testStyles.header}>
        <View style={testStyles.statusRow}>
          {getStatusIcon()}
          <Text style={[testStyles.title, { color: getStatusColor() }]}>
            Hook API Test Status
          </Text>
        </View>
      </View>

      <Text style={testStyles.message}>{testResult.message}</Text>

      {testResult.actual && (
        <View style={testStyles.valuesContainer}>
          <View style={testStyles.valueRow}>
            <Text style={testStyles.valueLabel}>
              Expected Indoor Threshold:
            </Text>
            <Text style={testStyles.expectedValue}>
              {testResult.expected.indoorZoomThreshold}
            </Text>
          </View>
          <View style={testStyles.valueRow}>
            <Text style={testStyles.valueLabel}>Actual Indoor Threshold:</Text>
            <Text
              style={[
                testStyles.actualValue,
                {
                  color:
                    testResult.actual.indoorZoomThreshold ===
                    testResult.expected.indoorZoomThreshold
                      ? "#10b981"
                      : "#ef4444",
                },
              ]}
            >
              {testResult.actual.indoorZoomThreshold}
            </Text>
          </View>
          <View style={testStyles.valueRow}>
            <Text style={testStyles.valueLabel}>
              Expected Outdoor Threshold:
            </Text>
            <Text style={testStyles.expectedValue}>
              {testResult.expected.outdoorZoomThreshold}
            </Text>
          </View>
          <View style={testStyles.valueRow}>
            <Text style={testStyles.valueLabel}>Actual Outdoor Threshold:</Text>
            <Text
              style={[
                testStyles.actualValue,
                {
                  color:
                    testResult.actual.outdoorZoomThreshold ===
                    testResult.expected.outdoorZoomThreshold
                      ? "#10b981"
                      : "#ef4444",
                },
              ]}
            >
              {testResult.actual.outdoorZoomThreshold}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default function DynamicFocusExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const [testResult, setTestResult] = React.useState<TestResult>({
    status: "idle",
    message: "Waiting for map to initialize...",
    expected: { indoorZoomThreshold: 17.5, outdoorZoomThreshold: 17 },
    actual: null,
  });

  const [eventTestResult, setEventTestResult] = React.useState<EventTestResult>(
    {
      status: "idle",
      message: "Waiting for map to initialize...",
      eventReceived: false,
    }
  );

  const handleTestUpdate = useCallback((result: TestResult) => {
    setTestResult(result);
  }, []);

  const handleEventTestUpdate = useCallback((result: EventTestResult) => {
    setEventTestResult(result);
  }, []);

  const handleMapReady = () => {
    console.log("Map ready");
  };

  const handleMapError = (error: string) => {
    console.error("Map error:", error);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Dynamic Focus</Text>
        <Text style={styles.description}>
          Experience advanced indoor mapping with intelligent focus management
          that automatically shows and hides building interiors based on camera
          position and zoom level. Now with improved hook architecture for
          seamless integration.
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
        <MapView
          style={styles.map}
          mapId="mappedin-demo-campus"
          onMapReady={handleMapReady}
          onError={handleMapError}
        >
          <MapSetup
            onTestUpdate={handleTestUpdate}
            onEventTestUpdate={handleEventTestUpdate}
          />
        </MapView>
      </View>

      {/* Test Status Section */}
      <TestStatusIndicator testResult={testResult} />

      {/* Event Test Status Section */}
      <EventTestStatusIndicator testResult={eventTestResult} />

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>🚀 Dynamic Focus Features:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Automatic Focus Control:</Text>{" "}
            Buildings fade in/out based on camera zoom and position
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Multiple Display Modes:</Text>{" "}
            Default floor, lock elevation, nearest elevation, and more
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Smart Floor Switching:</Text>{" "}
            Automatically changes floors when focusing on buildings
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Facade Height Adjustment:</Text>{" "}
            Dynamically adjusts building heights for better visibility
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Customizable Thresholds:</Text>{" "}
            Configure zoom levels for indoor/outdoor transitions
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Interactive Controls:</Text> Tap
            the ⚙️ button on the map to access all settings
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            <Text style={styles.featureBold}>Automatic Registration:</Text>{" "}
            Improved hook system handles extension registration seamlessly
            without manual setup
          </Text>
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📱 How to Use:</Text>
        <Text style={styles.instructionsText}>
          1. <Text style={styles.instructionsBold}>Zoom and Pan:</Text> Move
          around the campus to see buildings automatically focus{"\n"}
          2. <Text style={styles.instructionsBold}>Access Controls:</Text> Tap
          the ⚙️ button to open the control panel
          {"\n"}
          3. <Text style={styles.instructionsBold}>
            Try Different Modes:
          </Text>{" "}
          Experiment with different focus modes and settings{"\n"}
          4. <Text style={styles.instructionsBold}>
            Adjust Thresholds:
          </Text>{" "}
          Fine-tune zoom levels for your preferred experience
        </Text>
      </View>

      <View style={styles.codePreview}>
        <Text style={styles.codeTitle}>💻 Code Preview:</Text>
        <Text style={styles.codeText}>
          {`// React Native Hook Usage
import { useDynamicFocus, useDynamicFocusEvent } from '@mappedin/dynamic-focus/rn';

function MyComponent() {
  const { updateState, getState, isReady, enable, focusedFacades } = useDynamicFocus();

  // Listen for focus events
  useDynamicFocusEvent('focus', (event) => {
    console.log('Focused facades:', event.facades);
  });

  // Enable with options when ready
  useEffect(() => {
    if (isReady) {
      enable({
        autoFocus: true,
        mode: 'lock-elevation',
        indoorZoomThreshold: 18,
        outdoorZoomThreshold: 17,
      });
    }
  }, [isReady]);
}`}
        </Text>
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
    marginBottom: 12,
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
  featureBold: {
    fontWeight: "600",
    color: "#1f2937",
  },
  instructionsContainer: {
    backgroundColor: "#f0f9ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  instructionsBold: {
    fontWeight: "600",
    color: "#1f2937",
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

const testStyles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 20,
  },
  valuesContainer: {
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  valueLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  expectedValue: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  actualValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  passIcon: {
    fontSize: 16,
  },
  failIcon: {
    fontSize: 16,
  },
  idleIcon: {
    fontSize: 16,
  },
});
