import { useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Portal, PortalHost, PortalProvider } from "react-native-teleport";
import { MapView } from "@mappedin/react-native-sdk";
import { MAP_VIEW_OPTIONS, MAPPEDIN_OPTIONS } from "@/constants/mappedin";
import { FLAGS } from "@/constants/flags";
import { MapDataProvider, useMapData } from "@/context/MapDataContext";
import { SharedMapProvider, useSharedMap } from "@/context/SharedMapContext";
import { MapBrain } from "@/components/MapBrain";
import { MapOverlay } from "@/components/MapOverlay";

/**
 * The single MapView instance for the whole app. It is mounted once (and never
 * unmounted), and teleported into whichever screen's PortalHost is active, so
 * navigating between screens never recreates the underlying WebView.
 *
 * Data source depends on FLAGS.MAPVIEW_OWNS_DATA:
 *  - true: we pass the loading OPTIONS and the MapView loads + hydrates its own
 *    MapData (which MapBrain publishes back to MapDataContext).
 *  - false: we pass the already-loaded MapData instance from MapDataContext.
 *
 * Either way the map hydrates exactly once. The SDK guards getMapData/
 * hydrateMapData so they can each run only once per WebView session, so the
 * onMapReady/onError callbacks MUST be stable (see below).
 */
function PersistentMap() {
  const { mapData, setError } = useMapData();
  const { activeHost, setMapReady } = useSharedMap();

  // IMPORTANT: these MUST be stable references. The SDK's MapView lists onError
  // in its init effect's dependency array, so an inline arrow (new identity each
  // render) re-runs the effect mid-initialization and calls getMapData/
  // hydrateMapData a second time → "... can only be called once". useCallback
  // keeps them stable so the map initializes exactly once.
  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, [setMapReady]);
  const handleMapError = useCallback(
    (err: Error) => {
      // Surface the failure (and don't deadlock the launch loader, which in
      // MAPVIEW_OWNS_DATA mode waits for the published instance).
      setError(err);
      setMapReady(true);
    },
    [setError, setMapReady]
  );

  // Native-load mode waits for the instance before mounting the MapView; in
  // MapView-owns-data mode we hand it the options so it can load immediately.
  if (!FLAGS.MAPVIEW_OWNS_DATA && !mapData) {
    return null;
  }
  const mapDataProp = FLAGS.MAPVIEW_OWNS_DATA
    ? MAPPEDIN_OPTIONS
    : (mapData as NonNullable<typeof mapData>);

  return (
    // One map, always teleported into exactly one permanently-mounted host:
    // "parking" (hidden, keeps the WebView warm), "map-tab", or "detail". Because
    // every host stays mounted, the map is never reparented in the same native
    // transaction that removes a host — which is what crashed Android.
    //
    // `style` is the teleport node's own style, and it's the ONE spot the two
    // platforms differ (everything else is shared): on native it's just an empty
    // source placeholder, kept off-screen so it can't intercept touches; on web
    // the SAME node is what physically moves into the host, so it must FILL the
    // host it lands in instead.
    <Portal
      hostName={activeHost}
      style={Platform.OS === "web" ? styles.webFill : styles.parking}
    >
      <MapView
        style={styles.map}
        mapData={mapDataProp}
        options={MAP_VIEW_OPTIONS}
        onMapReady={handleMapReady}
        onError={handleMapError}
      >
        <MapBrain />
      </MapView>
      {/*
        Rendered inside the SAME portal as the map (after it) so it is reparented
        ABOVE the map in the active host. This is required for touches: the
        teleported map forwards hits to host subviews top-most first, so controls
        outside the portal (in the screen tree) never receive taps over the map.
      */}
      <MapOverlay />
    </Portal>
  );
}

function RootNavigator() {
  const { isLoading, error } = useMapData();
  const { mapReady, activeHost, detailFrame, detailMapOpacity } =
    useSharedMap();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load the map</Text>
        <Text style={styles.statusText}>{error.message}</Text>
      </View>
    );
  }

  // Native-load mode: wait for the MapData instance before mounting the tree, so
  // the whole tree (incl. the MapView) mounts in a single commit. In
  // MapView-owns-data mode the tree MUST mount while loading, because the
  // MapView inside it is what loads the data — so we don't gate on isLoading
  // there and instead cover with the loader overlay below.
  if (!FLAGS.MAPVIEW_OWNS_DATA && isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading mall map…</Text>
      </View>
    );
  }

  // Loader OVERLAY on top of the (mounted) tree: until data is ready, and when
  // WAIT_FOR_MAP_ON_LAUNCH is on, until the MapView's WebView has rendered
  // (onMapReady). It's a sibling and never changes when/where the MapView
  // mounts, so it can't retrigger the load guards.
  const showMapLoader =
    isLoading || (FLAGS.WAIT_FOR_MAP_ON_LAUNCH && !mapReady);

  // The shared "detail" host is permanently mounted here and positioned over the
  // active detail screen's measured map slot. When no detail screen owns the map
  // it's parked off-screen so it can't intercept touches on other screens.
  const detailHostActive = activeHost === "detail" && detailFrame != null;
  const detailHostStyle = detailHostActive
    ? {
        position: "absolute" as const,
        left: detailFrame.x,
        top: detailFrame.y,
        width: detailFrame.width,
        height: detailFrame.height,
      }
    : styles.parking;

  return (
    <View style={styles.root}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="location/[id]"
          options={{
            title: "Location",
            headerBackTitle: "Directory",
          }}
        />
      </Stack>
      {/*
        Single always-mounted host for detail screens. Because it never unmounts,
        moving the map in/out of it is always a clean reparent between live hosts
        — unlike the old per-screen hosts, which crashed when removed mid-reparent.

        It lives at the root (not inside the screen) so it can't ride the native
        slide on back-navigation; the wrapper's opacity cross-fades the map out as
        the screen slides away (driven from the detail screen on iOS) so it doesn't
        appear frozen mid-transition.
      */}
      <Animated.View
        style={[detailHostStyle, { opacity: detailMapOpacity }]}
        pointerEvents="box-none"
      >
        <PortalHost name="detail" style={StyleSheet.absoluteFill} />
      </Animated.View>
      {/*
        The map's hidden home when no screen owns it. A real, always-mounted host
        (parked off-screen) rather than just leaving the map at the <Portal>
        source: on web the teleport moves the actual node, so without a parking
        host the map would render on whatever screen the <Portal> sits in.
      */}
      <PortalHost name="parking" style={styles.parking} />
      {Platform.OS === "android" ? (
        // The teleport <Portal> source view sits above the screen on Android and
        // captures touches even while the map is physically reparented into the
        // off-screen parking host. pointerEvents="none" stops it from stealing
        // taps from the screens below; the live map lives in the (separate)
        // detail host subtree, so its interactivity is unaffected.
        <View pointerEvents="none">
          <PersistentMap />
        </View>
      ) : (
        <PersistentMap />
      )}

      {showMapLoader ? (
        <View style={[styles.centered, styles.launchOverlay]}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.statusText}>Loading mall map…</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <PortalProvider>
        <MapDataProvider>
          <SharedMapProvider>
            <RootNavigator />
          </SharedMapProvider>
        </MapDataProvider>
      </PortalProvider>
    </SafeAreaProvider>
  );
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Full-size (keeps the map laid out/warm) but parked completely off-screen.
  parking: {
    position: "absolute",
    width: SCREEN_W,
    height: SCREEN_H,
    top: 0,
    left: -SCREEN_W - 50,
  },
  map: {
    flex: 1,
  },
  // Web only: the teleport node itself moves into the host (native keeps a
  // separate placeholder), so it must fill whatever host it lands in.
  webFill: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  // Sits on top of the mounted app tree so the warm MapView can load underneath.
  launchOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  statusText: {
    marginTop: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
});
