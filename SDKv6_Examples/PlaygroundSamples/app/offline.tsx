import React, { useEffect, useState } from "react";
import type { ViewStyle } from "react-native";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import {
  MapView as MappedInView,
  useMap,
  unzipAndParseMVFv2,
  hydrateMapData,
} from "@mappedin/react-native-sdk";
import type Mappedin from "@mappedin/mappedin-js";

export interface MapViewProps {
  style?: ViewStyle;
  onMapReady?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

async function runOfflineDemo(mapView: any) {
  await mapView.StackedMaps.expand({
    distanceBetweenFloors: "auto",
  });
}

const MapSetup = () => {
  const { mapData, mapView } = useMap();

  useEffect(() => {
    if (mapData && mapView) {
      console.log("ready for business", mapData.getByType("space")[0].id);
      runOfflineDemo(mapView);
    }
  }, [mapData, mapView]);
  return <></>;
};

const MapView: React.FC<MapViewProps> = ({
  style,
  onMapReady,
  onError,
  children,
}) => {
  const [mapData, setMapData] = useState<Mappedin.MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("📱 Loading map data from local asset");

        // Add timing and detailed logging
        const startTime = Date.now();
        console.log(
          "🚀 Starting local file load at:",
          new Date().toISOString()
        );

        console.log("📁 Loading local MVF file...");
        const localAsset = Asset.fromModule(
          require("../assets/office-demo_mvf-v3.zip")
        );
        await localAsset.downloadAsync();

        if (!localAsset.localUri) {
          throw new Error("Local asset URI not available");
        }

        console.log("📁 Loading from local file:", localAsset.localUri);
        const fileInfo = await FileSystem.getInfoAsync(localAsset.localUri);
        console.log("📁 Local file info:", fileInfo);

        if (!fileInfo.exists) {
          throw new Error("Local file not found");
        }

        console.log("🔄 Reading file as base64...");
        const base64 = await FileSystem.readAsStringAsync(localAsset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log("🔄 Converting to ArrayBuffer...");
        const mvfBuffer = Uint8Array.from(atob(base64), (c) =>
          c.charCodeAt(0)
        ).buffer;
        console.log(
          `✅ Local file loaded successfully, size: ${mvfBuffer.byteLength} bytes`
        );

        console.log("🔄 Creating compressed array...");
        const compressed = new Uint8Array(mvfBuffer);

        const mvf = await unzipAndParseMVFv2(compressed);

        console.log("mvf parsed", Object.keys(mvf));

        console.log("🔄 Hydrating map data...");
        const mapData = await hydrateMapData(mvf);

        const totalTime = Date.now() - startTime;
        console.log(`🎉 Total process completed in ${totalTime}ms`);
        console.log("✅ Map data loaded successfully", !!mapData);
        setMapData(mapData);
        onMapReady?.();
      } catch (err) {
        console.error("💥 Error loading map data from local file:", err);
        // Log detailed error information
        if (err instanceof Error) {
          console.error("Error name:", err.name);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
          setError(err.message);
          onError?.(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [onMapReady, onError]);

  if (isLoading) {
    return (
      <View style={[mapStyles.container, style]}>
        <View style={mapStyles.loadingContainer}>
          <Text style={mapStyles.loadingText}>Loading offline map...</Text>
          <Text style={mapStyles.loadingSubtext}>
            Extracting local MVF file
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[mapStyles.container, style]}>
        <View style={mapStyles.errorContainer}>
          <Text style={mapStyles.errorText}>Failed to load map</Text>
          <Text style={mapStyles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!mapData) {
    return (
      <View style={[mapStyles.container, style]}>
        <Text>No map data available</Text>
      </View>
    );
  }

  return (
    <View style={[mapStyles.container, style]}>
      <MappedInView options={{}} mapData={mapData}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default function OfflineMapView() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  const handleMapReady = () => {
    console.log("🎉 Offline map is ready!");
  };

  const handleMapError = (error: string) => {
    console.error("💥 Offline map error:", error);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>💾 Offline Map View</Text>
        <Text style={styles.description}>
          This example demonstrates loading a map from a local MVF file bundled
          with the app, enabling offline functionality without internet
          connectivity.
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
          onMapReady={handleMapReady}
          onError={handleMapError}
        />
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Offline Features Demonstrated:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Load map from local MVF file</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            No internet connection required
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Unzip and parse MVF data locally
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Automatic stacked maps expansion
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Error handling for file loading issues
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Loading states and progress feedback
          </Text>
        </View>
      </View>

      <View style={styles.implementationContainer}>
        <Text style={styles.implementationTitle}>💡 Implementation Notes:</Text>
        <Text style={styles.implementationText}>
          The MVF file is bundled as an asset and loaded using Expo&apos;s
          FileSystem API. The file is read as base64, converted to ArrayBuffer,
          then processed by the Mappedin SDK&apos;s offline parsing utilities.
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
  implementationContainer: {
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
  implementationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  implementationText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
});
