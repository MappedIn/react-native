import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

const poiData = [
  { id: 1, name: "Starbucks Coffee", category: "Food & Drink", icon: "☕", floor: "L1" },
  { id: 2, name: "Apple Store", category: "Electronics", icon: "📱", floor: "L2" },
  { id: 3, name: "Information Desk", category: "Services", icon: "ℹ️", floor: "L1" },
  { id: 4, name: "Parking Garage", category: "Parking", icon: "🚗", floor: "B1" },
];

export default function POIDemo() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Points of Interest</Text>
        <Text style={styles.description}>
          Discover how to display and interact with location markers, labels, and venue information.
        </Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Interactive POI Map</Text>
        <View style={styles.poiMarkersContainer}>
          <View style={[styles.poiMarker, { top: 30, left: 40 }]}>
            <Text style={styles.markerText}>☕</Text>
          </View>
          <View style={[styles.poiMarker, { top: 60, right: 50 }]}>
            <Text style={styles.markerText}>📱</Text>
          </View>
          <View style={[styles.poiMarker, { bottom: 40, left: 60 }]}>
            <Text style={styles.markerText}>ℹ️</Text>
          </View>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>POI Features:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>🏷️</Text>
          <Text style={styles.featureText}>Custom marker styling and icons</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>🔍</Text>
          <Text style={styles.featureText}>Search and filter locations</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>💬</Text>
          <Text style={styles.featureText}>Interactive info popups</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>📊</Text>
          <Text style={styles.featureText}>Category-based grouping</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>🎯</Text>
          <Text style={styles.featureText}>Tap-to-navigate functionality</Text>
        </View>
      </View>

      <View style={styles.poiListContainer}>
        <Text style={styles.poiListTitle}>Sample POI Data:</Text>
        {poiData.map((poi) => (
          <TouchableOpacity key={poi.id} style={styles.poiItem}>
            <Text style={styles.poiIcon}>{poi.icon}</Text>
            <View style={styles.poiInfo}>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiCategory}>{poi.category} • Floor {poi.floor}</Text>
            </View>
            <Text style={styles.poiArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.codePreview}>
        <Text style={styles.codeTitle}>Code Preview:</Text>
        <Text style={styles.codeText}>
          {`// Add POI markers to the map
const markers = venues.locations.map(location => ({
  coordinate: location.coordinate,
  icon: getIconForCategory(location.category),
  label: location.name
}));

mapView.addMarkers(markers);`}
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
    backgroundColor: "#fefbeb",
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
    color: "#92400e",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
  },
  mapPlaceholder: {
    backgroundColor: "#fef3c7",
    height: 200,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#f59e0b",
    borderStyle: "dashed",
    position: "relative",
  },
  mapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d97706",
    marginBottom: 4,
  },
  poiMarkersContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  poiMarker: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    fontSize: 16,
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
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    lineHeight: 20,
  },
  poiListContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poiListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  poiItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  poiIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  poiCategory: {
    fontSize: 12,
    color: "#6b7280",
  },
  poiArrow: {
    fontSize: 16,
    color: "#f59e0b",
    fontWeight: "bold",
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
    color: "#f59e0b",
    fontWeight: "600",
  },
});
