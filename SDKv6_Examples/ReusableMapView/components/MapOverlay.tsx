import { useCallback, useLayoutEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Floor } from "@mappedin/mappedin-js";
import { useSharedMap } from "@/context/SharedMapContext";

// How long the almost-white cover takes to fade out and reveal the map.
const COVER_FADE_MS = 280;

/**
 * Interactive controls drawn on top of the map (floor selector + the detail
 * page's full-screen toggle).
 *
 * IMPORTANT: this is rendered as a child of the same <Portal> as the MapView so
 * it gets reparented into the active host ABOVE the map. react-native-teleport's
 * PortalView forwards touches to the host's subviews top-most first, so controls
 * placed in the screen tree (siblings of the host) never receive touches over
 * the map's frame — they must travel with the map inside the portal.
 *
 * The container is `box-none`, so empty areas fall through to the map (pan/zoom)
 * and only the actual buttons capture touches.
 */
export function MapOverlay() {
  const insets = useSafeAreaInsets();
  const {
    mapView,
    floors,
    currentFloorId,
    setCurrentFloorId,
    activeHost,
    mapExpanded,
    setMapExpanded,
    mapFocusing,
    setMapFocusing,
    mapReady,
  } = useSharedMap();

  // Cover the map with a light, almost-white layer while the camera moves, then
  // fade it out to reveal the settled view (used for open, expand and collapse).
  // useLayoutEffect + instant setValue so the cover is up BEFORE the frame that
  // shows the host resize / camera jump paints (otherwise it flickers); only the
  // reveal is a timed fade.
  const cover = useRef(new Animated.Value(0)).current;
  useLayoutEffect(() => {
    if (mapFocusing) {
      cover.stopAnimation();
      cover.setValue(1);
      return;
    }
    const animation = Animated.timing(cover, {
      toValue: 0,
      duration: COVER_FADE_MS,
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [mapFocusing, cover]);

  // Show the cover in the SAME update as the layout change so the resize never
  // paints uncovered.
  const expand = useCallback(() => {
    setMapFocusing(true);
    setMapExpanded(true);
  }, [setMapFocusing, setMapExpanded]);

  const collapse = useCallback(() => {
    setMapFocusing(true);
    setMapExpanded(false);
  }, [setMapFocusing, setMapExpanded]);

  const handleSelectFloor = useCallback(
    (floor: Floor) => {
      setCurrentFloorId(floor.id);
      mapView?.setFloor(floor);
    },
    [mapView, setCurrentFloorId]
  );

  // The full-screen toggle only makes sense on a detail page, where the map is
  // partial. The map tab is already full-screen.
  const canExpand =
    typeof activeHost === "string" && activeHost.startsWith("detail");
  // On a detail page the inline map is just a preview, so only surface the floor
  // selector once it's expanded to full screen. Elsewhere (e.g. the map tab)
  // show it whenever there's more than one floor.
  const showFloors = floors.length > 1 && (!canExpand || mapExpanded);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {showFloors ? (
        <View style={[styles.selector, { top: insets.top + 16 }]}>
          {floors.map((floor) => {
            const active = floor.id === currentFloorId;
            return (
              <Pressable
                key={floor.id}
                style={[styles.floorButton, active && styles.floorButtonActive]}
                onPress={() => handleSelectFloor(floor)}
                hitSlop={6}
              >
                <Text
                  style={[styles.floorLabel, active && styles.floorLabelActive]}
                  numberOfLines={1}
                >
                  {floor.shortName || floor.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {canExpand && mapExpanded ? (
        <Pressable
          onPress={collapse}
          hitSlop={8}
          style={[styles.toggle, { top: insets.top + 12, left: 16 }]}
        >
          <Text style={styles.toggleText}>✕ Close</Text>
        </Pressable>
      ) : null}

      {canExpand && !mapExpanded ? (
        <Pressable
          onPress={expand}
          hitSlop={8}
          style={[styles.toggle, styles.expandButton]}
        >
          <Text style={styles.toggleText}>⤢ Full screen</Text>
        </Pressable>
      ) : null}

      <Animated.View
        pointerEvents={mapFocusing ? "auto" : "none"}
        style={[styles.cover, { opacity: cover }]}
      />

      {/*
        First-load spinner: when the launch loader isn't blocking on the map
        (WAIT_FOR_MAP_ON_LAUNCH = false), show a spinner over the map the first
        time it loads on a screen. mapReady stays true afterwards, so it never
        shows again.
      */}
      {!mapReady ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    position: "absolute",
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  floorButton: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    marginVertical: 2,
  },
  floorButtonActive: {
    backgroundColor: "#2563eb",
  },
  floorLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  floorLabelActive: {
    color: "#ffffff",
  },
  toggle: {
    position: "absolute",
    backgroundColor: "rgba(17,24,39,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  expandButton: {
    right: 16,
    bottom: 16,
  },
  toggleText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f7f8fa",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
});
