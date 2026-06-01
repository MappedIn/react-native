import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";
import type { Floor } from "@mappedin/mappedin-js";
import type { MapViewControl } from "@mappedin/react-native-sdk";

/**
 * Named teleport host the single MapView can be reparented into. All three are
 * permanently mounted (the map only ever moves between hosts that never
 * unmount), so a host is never removed in the same native transaction as a
 * reparent — which is what crashed Android ("child already has a parent").
 *  - "parking": the off-screen Portal source that keeps the WebView warm.
 *  - "map-tab": the Map tab's host (a Tabs screen, stays mounted).
 *  - "detail": ONE host rendered in the root layout and positioned over the
 *    active detail screen's map slot (see `detailFrame`). Every detail screen
 *    instance shares it, so popping a detail never unmounts a host.
 */
export type MapHost = "parking" | "map-tab" | "detail";

/**
 * The on-screen frame of the active detail screen's map slot, in the root
 * layout's coordinate space. The root positions the shared "detail" host here so
 * the map appears in place even though the host itself lives at the root.
 */
export type DetailFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SharedMapContextValue = {
  mapView: MapViewControl | null;
  setMapView: (mapView: MapViewControl | null) => void;
  floors: Floor[];
  setFloors: (floors: Floor[]) => void;
  currentFloorId: string | null;
  setCurrentFloorId: (id: string | null) => void;
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  activeHost: MapHost;
  setActiveHost: (host: MapHost) => void;
  /**
   * Frame of the active detail screen's map slot (root-layout coordinates), so
   * the root can position the shared "detail" host over it. `null` until a detail
   * screen publishes it.
   */
  detailFrame: DetailFrame | null;
  setDetailFrame: (frame: DetailFrame | null) => void;
  /**
   * Opacity of the shared "detail" host. The host lives at the root (a sibling of
   * the navigator), so it can't ride the native screen's slide animation on back
   * navigation. Instead we cross-fade it out as the screen slides away — driving
   * this value avoids the map appearing to freeze in place mid-transition.
   */
  detailMapOpacity: Animated.Value;
  /** Whether the map should fill the screen (detail page "full screen" toggle). */
  mapExpanded: boolean;
  setMapExpanded: (expanded: boolean) => void;
  /**
   * True while the map is moving the camera to focus the selected location, so
   * the detail page can show a spinner until the profile's view is ready.
   */
  mapFocusing: boolean;
  setMapFocusing: (focusing: boolean) => void;
  /** True once the persistent MapView has loaded (fires once, then stays true). */
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
};

const SharedMapContext = createContext<SharedMapContextValue | undefined>(
  undefined
);

/**
 * Holds the state shared between the single persistent MapView (rendered once
 * at the root) and the screens that drive it: the mapView control, the floor
 * list/selection, the currently selected location, and which teleport host the
 * map is currently parented into.
 */
export function SharedMapProvider({ children }: { children: React.ReactNode }) {
  const [mapView, setMapView] = useState<MapViewControl | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloorId, setCurrentFloorId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [activeHost, setActiveHost] = useState<MapHost>("parking");
  const [detailFrame, setDetailFrame] = useState<DetailFrame | null>(null);
  const detailMapOpacity = useRef(new Animated.Value(1)).current;
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapFocusing, setMapFocusing] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const value = useMemo<SharedMapContextValue>(
    () => ({
      mapView,
      setMapView,
      floors,
      setFloors,
      currentFloorId,
      setCurrentFloorId,
      selectedLocationId,
      setSelectedLocationId,
      activeHost,
      setActiveHost,
      detailFrame,
      setDetailFrame,
      detailMapOpacity,
      mapExpanded,
      setMapExpanded,
      mapFocusing,
      setMapFocusing,
      mapReady,
      setMapReady,
    }),
    [
      mapView,
      floors,
      currentFloorId,
      selectedLocationId,
      activeHost,
      detailFrame,
      detailMapOpacity,
      mapExpanded,
      mapFocusing,
      mapReady,
    ]
  );

  return (
    <SharedMapContext.Provider value={value}>
      {children}
    </SharedMapContext.Provider>
  );
}

export function useSharedMap(): SharedMapContextValue {
  const context = useContext(SharedMapContext);
  if (!context) {
    throw new Error("useSharedMap must be used within a SharedMapProvider");
  }
  return context;
}
