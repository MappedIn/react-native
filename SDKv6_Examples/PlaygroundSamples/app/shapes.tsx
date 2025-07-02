import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  MapView as MappedInView,
  useMap,
  useEvent,
  Marker,
  Shape,
  Mappedin,
} from "@mappedin/react-native-sdk";

// Custom geometry data (simplified version of the React example)
// prettier-ignore
const customGeometry = { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [[[-78.16206431062261, 43.97410968521617], [-78.16208802106577, 43.974108846947225], [-78.16211150316241, 43.974106340213424], [-78.16213453076519, 43.974102189156234], [-78.16215688210393, 43.974096433752905], [-78.16217834192148, 43.97408912943158], [-78.16219870354679, 43.97408034653744], [-78.16221777088535, 43.974070169655185], [-78.16223536030766, 43.974058696794444], [-78.16225130241781, 43.97404603844584], [-78.16226544368473, 43.97403231651693], [-78.16227764792087, 43.97401766315807], [-78.16228779759372, 43.97400221948975], [-78.16229579495764, 43.973986134243496], [-78.16230156299521, 43.97396956232947], [-78.16230504615883, 43.97395266334462], [-78.16230621090564, 43.9739356000356], [-78.16230504602049, 43.973918536731496], [-78.16230156272385, 43.973901637761166], [-78.16229579456369, 43.97388506587072], [-78.1622877970923, 43.9738689806562], [-78.16227764733127, 43.97385353702654], [-78.16226544302958, 43.97383888371179], [-78.16225130172232, 43.97382516183075], [-78.16223535959855, 43.973812503531924], [-78.16221777018987, 43.97380103072096], [-78.16219870289166, 43.97379085388658], [-78.16217834133188, 43.973782071036545], [-78.16215688160251, 43.9737747667539], [-78.16213453037122, 43.973769011382295], [-78.16211150289105, 43.97376486034867], [-78.16208802092744, 43.973762353629404], [-78.16206431062261, 43.97376151536536], [-78.1620406003178, 43.973762353629404], [-78.16201711835419, 43.97376486034867], [-78.16199409087402, 43.973769011382295], [-78.16197173964272, 43.9737747667539], [-78.16195027991336, 43.973782071036545], [-78.16192991835358, 43.97379085388658], [-78.16191085105537, 43.97380103072096], [-78.16189326164668, 43.973812503531924], [-78.16187731952292, 43.97382516183075], [-78.16186317821565, 43.97383888371179], [-78.16185097391397, 43.97385353702654], [-78.16184082415293, 43.9738689806562], [-78.16183282668155, 43.97388506587072], [-78.16182705852138, 43.973901637761166], [-78.16182357522474, 43.973918536731496], [-78.1618224103396, 43.9739356000356], [-78.1618235750864, 43.97395266334462], [-78.16182705825003, 43.97396956232947], [-78.1618328262876, 43.973986134243496], [-78.16184082365152, 43.97400221948975], [-78.16185097332436, 43.97401766315807], [-78.1618631775605, 43.97403231651693], [-78.16187731882742, 43.97404603844584], [-78.16189326093757, 43.974058696794444], [-78.16191085035989, 43.974070169655185], [-78.16192991769844, 43.97408034653744], [-78.16195027932376, 43.97408912943158], [-78.16197173914131, 43.974096433752905], [-78.16199409048005, 43.974102189156234], [-78.16201711808283, 43.974106340213424], [-78.16204060017947, 43.974108846947225], [-78.16206431062261, 43.97410968521617]]] } }] };

const MapSetup = () => {
  const { mapView } = useMap();

  const [style, setStyle] = useState({
    color: "red",
    altitude: 0.2,
    height: 2,
    opacity: 0.7,
  });

  const handleShapeLoad = useCallback(
    (shape: Mappedin.Shape) => {
      console.log("Shape loaded successfully:", shape.id);

      // Focus on the shape when it loads
      if (mapView && shape) {
        mapView.Camera.focusOn(shape, {
          duration: 1000,
          maxZoomLevel: 19,
        });

        // Comment out the animateState code to test style prop updates
        // setInterval(() => {
        // 	mapView.animateState(shape, {
        // 		altitude: Math.random() * 10,
        // 		color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        // 		height: Math.random() * 5,
        // 		opacity: Math.random() * 0.5 + 0.5,
        // 	}, {duration: 1000});
        // }, 1000);

        // Instead, update the style prop with random values to test updateState functionality
        setInterval(() => {
          setStyle({
            altitude: Math.random() * 10,
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            height: Math.random() * 5,
            opacity: Math.random() * 0.5 + 0.5,
          });
        }, 1000);
      }
    },
    [mapView]
  );

  return (
    <View>
      <Shape
        geometry={customGeometry as any}
        style={style}
        onLoad={handleShapeLoad}
      />
    </View>
  );
};

export default function ShapesExample() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔷 Custom Shapes</Text>
        <Text style={styles.description}>
          This example demonstrates how to display custom 3D geometry on the map
          with various styling options and interactive controls.
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
              key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
              secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
              mapId: "64ef49e662fd90fe020bee61",
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
            Custom GeoJSON polygon geometry rendering with the Shape component
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Continuous random style updates every 1000ms using updateState
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Random color generation using hexadecimal values
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Dynamic altitude changes (0-10 units) and height variations (0-5
            units)
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Automatic camera focus on shape load with zoom level 19
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Opacity randomization between 0.5-1.0 for visual effects
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
