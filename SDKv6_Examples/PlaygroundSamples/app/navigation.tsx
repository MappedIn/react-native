import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Navigation() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>🧭 Navigation & Routing</Text>
        <Text style={styles.description}>
          Explore wayfinding capabilities with turn-by-turn directions and route optimization.
        </Text>
      </View>

      <View style={styles.routePlaceholder}>
        <Text style={styles.routeText}>Route Visualization</Text>
        <Text style={styles.routeSubtext}>Start → Destination path</Text>
        <View style={styles.routeLine} />
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Navigation Features:</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>🎯</Text>
          <Text style={styles.featureText}>Point-to-point routing</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>🔄</Text>
          <Text style={styles.featureText}>Multi-floor route planning</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>📱</Text>
          <Text style={styles.featureText}>Turn-by-turn instructions</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>⚡</Text>
          <Text style={styles.featureText}>Shortest path calculation</Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>♿</Text>
          <Text style={styles.featureText}>Accessibility route options</Text>
        </View>
      </View>

      <View style={styles.demoContainer}>
        <Text style={styles.demoTitle}>Try Navigation:</Text>
        <View style={styles.demoButtons}>
          <TouchableOpacity style={styles.demoButton}>
            <Text style={styles.buttonText}>🏪 To Store</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoButton}>
            <Text style={styles.buttonText}>🚻 To Restroom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoButton}>
            <Text style={styles.buttonText}>🚪 To Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.codePreview}>
        <Text style={styles.codeTitle}>Code Preview:</Text>
        <Text style={styles.codeText}>
          {`// Create a route between two points
const route = await mapView.getDirections({
  from: startLocation,
  to: destinationLocation,
  accessible: false
});

// Display the route on the map
mapView.showRoute(route);`}
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
    backgroundColor: "#f0fdf4",
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
    color: "#166534",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
  },
  routePlaceholder: {
    backgroundColor: "#dcfce7",
    height: 180,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#4ade80",
    borderStyle: "dashed",
    position: "relative",
  },
  routeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#15803d",
    marginBottom: 4,
  },
  routeSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  routeLine: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: "#22c55e",
    borderRadius: 2,
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
  demoContainer: {
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
  demoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  demoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  demoButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    color: "#22c55e",
    fontWeight: "600",
  },
});
