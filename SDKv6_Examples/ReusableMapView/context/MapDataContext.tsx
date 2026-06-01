import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getMapData,
  type EnterpriseLocation,
  type MapData,
} from "@mappedin/mappedin-js";
import { MAPPEDIN_OPTIONS } from "@/constants/mappedin";
import { FLAGS } from "@/constants/flags";

type MapDataContextValue = {
  mapData: MapData | null;
  locations: EnterpriseLocation[];
  isLoading: boolean;
  error: Error | null;
  getLocation: (id: string) => EnterpriseLocation | undefined;
  /**
   * Publish the MapData the MapView loaded itself (MAPVIEW_OWNS_DATA mode). Used
   * by MapBrain so the directory/detail screens share the MapView's instance.
   */
  setMapData: (data: MapData) => void;
  /** Surface a map load/render failure to the rest of the app. */
  setError: (error: Error) => void;
};

const MapDataContext = createContext<MapDataContextValue | undefined>(
  undefined
);

export function getSortedLocations(mapData: MapData): EnterpriseLocation[] {
  return mapData
    .getByType("enterprise-location")
    .filter((location) => !location.hidden && Boolean(location.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Provides the venue data for the directory/detail screens.
 *
 * Two sources, controlled by FLAGS.MAPVIEW_OWNS_DATA:
 *  - true: the MapView (WebView) loads the data; MapBrain publishes it here via
 *    setMapData. We start "loading" until that instance arrives.
 *  - false: we load it natively here with getMapData and also pass it into the
 *    MapView to hydrate.
 */
export function MapDataProvider({ children }: { children: React.ReactNode }) {
  const [mapData, setMapDataState] = useState<MapData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  // Only meaningful in native-load mode; in MapView-owns-data mode loading is
  // derived from whether the instance has been published yet.
  const [nativeLoading, setNativeLoading] = useState(!FLAGS.MAPVIEW_OWNS_DATA);

  useEffect(() => {
    if (FLAGS.MAPVIEW_OWNS_DATA) {
      // The MapView loads its own data; nothing to fetch here.
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const data = await getMapData(MAPPEDIN_OPTIONS);
        if (!cancelled) {
          setMapDataState(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setNativeLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setMapData = useCallback((data: MapData) => {
    setMapDataState(data);
  }, []);

  const value = useMemo<MapDataContextValue>(() => {
    const locations = mapData ? getSortedLocations(mapData) : [];
    const isLoading = FLAGS.MAPVIEW_OWNS_DATA
      ? !mapData && !error
      : nativeLoading;
    return {
      mapData,
      locations,
      isLoading,
      error,
      getLocation: (id: string) =>
        mapData?.getById("enterprise-location", id) ?? undefined,
      setMapData,
      setError,
    };
  }, [mapData, error, nativeLoading, setMapData]);

  return (
    <MapDataContext.Provider value={value}>{children}</MapDataContext.Provider>
  );
}

export function useMapData(): MapDataContextValue {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error("useMapData must be used within a MapDataProvider");
  }
  return context;
}
