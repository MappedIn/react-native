import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import {
  MapView as MappedInView,
  useMap,
  useMapViewEvent,
  Model,
} from "@mappedin/react-native-sdk";
import type Mappedin from "@mappedin/mappedin-js";

const MapSetup = () => {
  const { mapData, mapView } = useMap();
  const [modelStates, setModelStates] = useState<any[]>([]);
  const [modelStateIdMap, setMap] = useState<Record<string, any>>({});
  const [duckModelUrl, setDuckModelUrl] = useState<string | null>(null);
  const selectedModel = useRef<any>(null);

  // Load duck model from local asset
  useEffect(() => {
    const loadDuckModel = async () => {
      try {
        console.log("🦆 Loading duck model from local asset");

        // Load the local duck.glb file
        const localAsset = Asset.fromModule(require("../assets/duck.glb"));
        await localAsset.downloadAsync();

        if (!localAsset.localUri) {
          throw new Error("Local duck asset URI not available");
        }

        console.log("🦆 Reading duck model as base64...");
        const base64 = await FileSystem.readAsStringAsync(localAsset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create data URI for the model
        const dataUri = `data:application/octet-stream;base64,${base64}`;
        setDuckModelUrl(dataUri);
        console.log("✅ Duck model loaded successfully from local asset");
      } catch (err) {
        console.error("💥 Error loading duck model from local asset:", err);
      }
    };

    loadDuckModel();
  }, []);

  // Initialize models when mapData is available
  useEffect(() => {
    if (!mapData || !mapView) return;

    const allSpaces = mapData.getByType("space");

    // Take first 8 spaces to avoid cluttering the map
    const selectedSpaces = allSpaces.slice(0, 4);

    mapView.Camera.focusOn(selectedSpaces, {
      maxZoomLevel: 18,
    });

    const initialModelStates: (Mappedin.InitializeModelState & {
      spaceName: string;
    })[] = selectedSpaces.map((space: any, index: number) => ({
      id: `model-${space.id}`,
      target: space.center,
      scale: [2, 2, 2] as [number, number, number],
      rotation: [90, Math.random() * 360, 0] as [number, number, number],
      verticalOffset: 0,
      color: "#ff4444", // Red color for unselected models
      opacity: 1,
      interactive: true,
      spaceName: space.name || `Space ${index + 1}`,
    }));

    setModelStates(initialModelStates);
    console.log(`Created ${initialModelStates.length} models on spaces`);
  }, [mapData, mapView]);

  // Handle map clicks for model interaction
  const clickCallback = useCallback(
    (payload: any) => {
      console.log("Click payload:", payload);

      if (payload.models && payload.models.length > 0) {
        // Clicked on a model - select it
        const clickedModel = payload.models[0];
        selectedModel.current = clickedModel;

        console.log("Selected model:", clickedModel.id);

        // Update model states - make clicked model blue and larger, others red and normal size
        setModelStates((prev) =>
          prev.map((state) => {
            const isSelected =
              modelStateIdMap[state.id]?.id === clickedModel.id;
            return {
              ...state,
              target: clickedModel.position,
              scale: isSelected ? [5, 5, 5] : [2, 2, 2],
              color: isSelected ? "#0000ff" : "#ff0000", // Blue for selected, red for others
              verticalOffset: isSelected ? 0 : 1,
              opacity: isSelected ? 0.8 : 1,
            };
          })
        );
      } else if (selectedModel.current && payload.coordinate) {
        // Clicked on empty space with a model selected - move the selected model
        const targetCoordinate = payload.coordinate;
        console.log("New position:", targetCoordinate);
        console.log(
          "Moving selected model to:",
          selectedModel.current.id,
          targetCoordinate
        );

        setModelStates((prev) =>
          prev.map((state) => {
            if (modelStateIdMap[state.id]?.id === selectedModel.current?.id) {
              return {
                ...state,
                target: targetCoordinate,
                spaceName: "Moved Model", // Update name to indicate it was moved
              };
            }
            return state;
          })
        );
      } else if (payload.spaces && payload.spaces.length > 0) {
        console.log("Clicked on space:", payload.spaces[0].name);
      } else {
        console.log("Clicked at coordinate:", payload.coordinate);
      }
    },
    [modelStateIdMap]
  );

  useMapViewEvent("click", clickCallback);

  // Don't render models until duck model URL is loaded
  if (!duckModelUrl) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading duck model... 🦆</Text>
      </View>
    );
  }

  // See Demo API key Terms and Conditions
  // Demo Key & Maps: https://developer.mappedin.com/docs/demo-keys-and-maps
  return (
    <View>
      {/* Render all models */}
      {modelStates.map((modelState) => (
        <Model
          key={modelState.id}
          target={modelState.position}
          url={duckModelUrl}
          options={{
            scale: modelState.scale,
            color: modelState.color,
            rotation: modelState.rotation,
            opacity: modelState.opacity,
            interactive: modelState.interactive,
          }}
          onLoad={(model: any) => {
            console.log("Model loaded:", {
              id: model.id,
              spaceName: modelState.spaceName,
              target: model.position,
            });
            setMap((prev) => ({
              ...prev,
              [modelState.id]: model,
            }));
          }}
        />
      ))}
    </View>
  );
};

export default function ModelsExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🦆 3D Models</Text>
        <Text style={styles.description}>
          This example demonstrates how to place interactive 3D models on the
          map that can be selected and moved. Models are loaded from local
          assets for better performance and offline capabilities.
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
          <MappedInView
            mapData={{
              key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
              secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
              mapId: "65c0ff7430b94e3fabd5bb8c",
            }}
          >
            <MapSetup />
          </MappedInView>
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to Interact:</Text>

        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Click on a duck</Text> to select it (it
            will turn blue and grow larger)
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Click anywhere else</Text> on the map to
            move the selected duck to that location
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Click another duck</Text> to select it
            instead
          </Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Loading 3D models from local assets (Duck.glb)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Converting local assets to base64 data URIs for model loading
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Placing models on space coordinates automatically
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Interactive model selection and visual feedback
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Dynamic model positioning via click events
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Customizable model properties (scale, rotation, opacity)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Model loading callbacks and state management
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
  instructionsContainer: {
    backgroundColor: "#e6f3ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e3a8a",
    textAlign: "center",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 12,
    marginTop: 2,
    width: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
    color: "#1e3a8a",
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
