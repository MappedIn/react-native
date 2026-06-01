import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { PortalHost } from "react-native-teleport";
import { useSharedMap } from "@/context/SharedMapContext";

export default function MapScreen() {
  const { setActiveHost, setSelectedLocationId } = useSharedMap();

  // Claim the shared map into this screen's host while focused (browse mode),
  // and hand it back to the parking host when leaving. Floor selection and other
  // controls are drawn by <MapOverlay /> (inside the portal) so they receive
  // touches over the teleported map.
  useFocusEffect(
    useCallback(() => {
      setActiveHost("map-tab");
      setSelectedLocationId(null);
      return () => {
        setActiveHost("parking");
      };
    }, [setActiveHost, setSelectedLocationId])
  );

  return (
    <View style={styles.container}>
      <PortalHost name="map-tab" style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8eaed",
  },
  map: {
    flex: 1,
  },
});
