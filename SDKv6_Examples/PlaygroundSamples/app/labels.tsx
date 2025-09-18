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
  useMapViewEvent,
  Label,
} from "@mappedin/react-native-sdk";
import type Mappedin from "@mappedin/mappedin-js";

const icon1 = `<svg width="92" height="92" viewBox="-17 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
	<g clip-path="url(#clip0)">
	<path d="M53.99 28.0973H44.3274C41.8873 28.0973 40.7161 29.1789 40.7161 31.5387V61.1837L21.0491 30.7029C19.6827 28.5889 18.8042 28.1956 16.0714 28.0973H6.5551C4.01742 28.0973 2.84619 29.1789 2.84619 31.5387V87.8299C2.84619 90.1897 4.01742 91.2712 6.5551 91.2712H16.2178C18.7554 91.2712 19.9267 90.1897 19.9267 87.8299V58.3323L39.6912 88.6656C41.1553 90.878 41.9361 91.2712 44.669 91.2712H54.0388C56.5765 91.2712 57.7477 90.1897 57.7477 87.8299V31.5387C57.6501 29.1789 56.4789 28.0973 53.99 28.0973Z" fill="black"/>
	<path d="M11.3863 21.7061C17.2618 21.7061 22.025 16.9078 22.025 10.9887C22.025 5.06961 17.2618 0.27124 11.3863 0.27124C5.51067 0.27124 0.747559 5.06961 0.747559 10.9887C0.747559 16.9078 5.51067 21.7061 11.3863 21.7061Z" fill="black"/>
	</g>
	<defs>
	<clipPath id="clip0">
	<rect width="57" height="91" fill="white" transform="translate(0.747559 0.27124)"/>
</svg>`;

const MapSetup = () => {
  const { mapData, mapView } = useMap();
  const [clickedLabel, setClickedLabel] = useState<any>(null);

  // Specific spaces we want to create labels for
  const [sirenSpace, setSirenSpace] = useState<any>(null);
  const [sbarroSpace, setSbarroSpace] = useState<any>(null);

  // Target for the moveable label (for position updates)
  const [moveableLabelTarget, setMoveableLabelTarget] = useState<any>(null);
  const [moveableLabel, setMoveableLabel] = useState<any>(null);

  // State for dynamic label behaviors
  const [sbarroTextVariant, setSbarroTextVariant] = useState(0);
  const [sirensRankIndex, setSirensRankIndex] = useState(0);

  // Reference to the Siren label for updateState calls
  const [sirenLabel, setSirenLabel] = useState<any>(null);

  // State for zoom-based secondary labels
  const [secondaryLabelsEnabled, setSecondaryLabelsEnabled] = useState(false);

  const sbarroTextOptions = [
    "🍕 Sbarro - Fresh Pizza!",
    "🍝 Sbarro - Italian Delights",
    "🥗 Sbarro - Salads & More",
    "🍕 Sbarro - New York Style",
  ];

  const sirensRankOptions: ("low" | "medium" | "high" | "always-visible")[] = [
    "low",
    "medium",
    "high",
    "always-visible",
  ];

  // Primary labels - always visible
  const [primaryLabels] = useState<any[]>([]);
  const [secondaryLabels] = useState<any[]>([]);

  const clickCallback = useCallback(
    (payload: any) => {
      if (payload.labels && payload.labels.length > 0) {
        // Clicked on a label - set as selected and focus camera
        const label = payload.labels[0];
        console.log("clicked on label:", label);
        setClickedLabel(label);

        // Special behavior for moveable label - remove it when clicked
        if (label.id === moveableLabel?.id) {
          console.log("clicked on moveable label - removing");
          setMoveableLabelTarget(null);
        }
      } else {
        console.log("clicked on map:", payload.coordinate);
        // Clicked on empty space - clear selection or move the moveable label
        if (moveableLabelTarget) {
          setMoveableLabelTarget(payload.coordinate);
        } else {
          setClickedLabel(null);
        }
      }
    },
    [moveableLabel, moveableLabelTarget]
  );

  // Handle map clicks for label selection and moveable label positioning
  useMapViewEvent("click", clickCallback);

  // Handle camera changes for zoom-based label visibility
  useMapViewEvent("camera-change", (transform: Mappedin.CameraTransform) => {
    if (transform.zoomLevel < 20) {
      setSecondaryLabelsEnabled(false);
    } else {
      setSecondaryLabelsEnabled(true);
    }
  });

  useEffect(() => {
    if (mapData) {
      // Find specific spaces by name
      const allSpaces = mapData.getByType("space");

      const sirens = allSpaces.find(
        (space: Mappedin.Space) =>
          space.name && space.name.toLowerCase().includes("sirens")
      );
      const sbarro = allSpaces.find(
        (space: Mappedin.Space) =>
          space.name && space.name.toLowerCase().includes("sbarro")
      );
      const urbanPlanet = allSpaces.find(
        (space: Mappedin.Space) =>
          space.name && space.name.toLowerCase().includes("urban planet")
      );

      setSirenSpace(sirens);
      setSbarroSpace(sbarro);
      setMoveableLabelTarget(urbanPlanet);

      // Set up primary and secondary labels
      const spacesWithNames = allSpaces.filter(
        (space: Mappedin.Space) => space.name !== ""
      );

      // Primary labels (first 8 spaces)
      primaryLabels.length = 0;
      primaryLabels.push(
        ...spacesWithNames.slice(0, 8).map((space: Mappedin.Space) => ({
          target: space,
          text: `📍 ${space.name}`,
          options: {
            enabled: true,
            rank: "medium" as const,
            interactive: true,
          },
        }))
      );

      // Secondary labels (next 10 spaces)
      secondaryLabels.length = 0;
      secondaryLabels.push(
        ...spacesWithNames.slice(8, 18).map((space: Mappedin.Space) => ({
          target: space,
          text: `🏪 ${space.name}`,
          options: {
            enabled: secondaryLabelsEnabled,
            rank: "low" as const,
            interactive: true,
          },
        }))
      );

      console.log("Found spaces:", {
        sirens,
        sbarro,
        urbanPlanet,
        totalSpaces: spacesWithNames.length,
      });
    }
  }, [mapData]);

  // Animation timers for dynamic behaviors
  useEffect(() => {
    // Timer for changing Sbarro text content every 2 seconds
    const sbarroTimer = setInterval(() => {
      setSbarroTextVariant((prev) => (prev + 1) % sbarroTextOptions.length);
    }, 2000);

    // Timer for changing Sirens rank every 3 seconds
    const sirensTimer = setInterval(() => {
      setSirensRankIndex((prev: number) => {
        const newIndex = (prev + 1) % sirensRankOptions.length;

        // Update the label's rank using updateState if label exists
        if (sirenLabel && mapView) {
          mapView.updateState(sirenLabel, {
            rank: sirensRankOptions[newIndex],
          });
        }

        return newIndex;
      });
    }, 3000);

    return () => {
      clearInterval(sbarroTimer);
      clearInterval(sirensTimer);
    };
  }, [sbarroTextOptions.length, sirensRankOptions.length, sirenLabel, mapView]);

  // Focus camera on clicked label
  useEffect(() => {
    if (clickedLabel && mapView) {
      mapView.Camera.focusOn(clickedLabel, {
        maxZoomLevel: 20,
        duration: 300,
        easing: "ease-in-out",
      });
    } else if (mapView) {
      mapView.Camera.focusOn(mapView.currentFloor, {
        duration: 300,
        easing: "ease-in-out",
      });
    }
  }, [clickedLabel, mapView]);

  return (
    <View style={{}}>
      {/* Sirens label - tests options updates (rank changes) */}
      {sirenSpace && (
        <Label
          key="sirens-label"
          target={sirenSpace}
          text={`🎵 Sirens (${sirensRankOptions[sirensRankIndex]})`}
          options={{
            interactive: true,
            rank: sirensRankOptions[sirensRankIndex],
            appearance: {
              textColor:
                clickedLabel?.target?.id === sirenSpace.id ? "#E91E63" : "#333",
              pinColor:
                clickedLabel?.target?.id === sirenSpace.id
                  ? "#E91E63"
                  : "#4CAF50",
              pinColorInactive: "#999",
              icon: icon1,
            },
          }}
          onLoad={(label) => {
            console.log("Sirens label loaded:", label);
            setSirenLabel(label);
          }}
        />
      )}

      {/* Sbarro label - tests text content updates */}
      {sbarroSpace && (
        <Label
          key="sbarro-label"
          target={sbarroSpace}
          text={sbarroTextOptions[sbarroTextVariant]}
          options={{
            interactive: true,
            rank: "always-visible",
            appearance: {
              textColor:
                clickedLabel?.target?.id === sbarroSpace.id
                  ? "#FF6B35"
                  : "#333",
              pinColor:
                clickedLabel?.target?.id === sbarroSpace.id
                  ? "#FF6B35"
                  : "#2196F3",
              pinColorInactive: "#999",
              icon: icon1,
            },
          }}
          onLoad={(label) => {
            console.log("Sbarro label loaded:", label.id);
          }}
        />
      )}

      {/* Moveable label - tests target repositioning */}
      {moveableLabelTarget && (
        <Label
          key="moveable-label"
          target={moveableLabelTarget}
          text="👕 Urban Planet (click to move me!)"
          options={{
            interactive: true,
            rank: "always-visible",
            appearance: {
              textColor:
                clickedLabel?.target?.id === moveableLabelTarget.id
                  ? "#9C27B0"
                  : "#333",
              pinColor:
                clickedLabel?.target?.id === moveableLabelTarget.id
                  ? "#9C27B0"
                  : "#FF9800",
              pinColorInactive: "#999",
              icon: icon1,
            },
          }}
          onLoad={(label) => {
            console.log("Moveable label loaded:", label);
            setMoveableLabel(label);
          }}
        />
      )}

      {/* Primary labels - always visible */}
      {primaryLabels.map((labelData) => (
        <Label
          key={`primary-${labelData.target.id}`}
          target={labelData.target}
          text={
            clickedLabel?.target?.id === labelData.target.id
              ? `✅ SELECTED: ${labelData.text}`
              : labelData.text
          }
          options={{
            ...labelData.options,
            appearance: {
              textColor:
                clickedLabel?.target?.id === labelData.target.id
                  ? "#f44336"
                  : "#666",
              pinColor:
                clickedLabel?.target?.id === labelData.target.id
                  ? "#f44336"
                  : "#607D8B",
              pinColorInactive: "#999",
              icon: icon1,
            },
            rank:
              clickedLabel?.target?.id === labelData.target.id
                ? "always-visible"
                : "medium",
          }}
        />
      ))}

      {/* Secondary labels - zoom-based visibility */}
      {secondaryLabels.map((labelData) => (
        <Label
          key={`secondary-${labelData.target.id}`}
          target={labelData.target}
          text={
            clickedLabel?.target?.id === labelData.target.id
              ? `✅ SELECTED: ${labelData.text}`
              : labelData.text
          }
          options={{
            ...labelData.options,
            enabled: secondaryLabelsEnabled,
            appearance: {
              textColor:
                clickedLabel?.target?.id === labelData.target.id
                  ? "#f44336"
                  : "#888",
              pinColor:
                clickedLabel?.target?.id === labelData.target.id
                  ? "#f44336"
                  : "#795548",
              pinColorInactive: "#999",
              icon: icon1,
            },
            rank:
              clickedLabel?.target?.id === labelData.target.id
                ? "always-visible"
                : "low",
          }}
        />
      ))}
    </View>
  );
};

export default function LabelsExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🏷️ Labels</Text>
        <Text style={styles.description}>
          This example demonstrates various ways to use the Label component,
          including dynamic updates to content and properties, showing/hiding
          labels, and handling click events.
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
            Adding text labels tied to map locations
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Dynamically updating label text content (Sbarro label)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Dynamically updating label properties like rank (Sirens label)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Moving labels to new coordinates on map click (Urban Planet label)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Handling label click events with visual feedback
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Zoom-based label visibility (secondary labels appear at zoom {">"}
            20)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Camera focusing on clicked labels
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Different label appearances and styling based on state
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
