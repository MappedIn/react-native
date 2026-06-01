import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Marker, useMap, useMapViewEvent } from "@mappedin/react-native-sdk";
import type { MapViewControl } from "@mappedin/react-native-sdk";
import type { EnterpriseLocation, Floor } from "@mappedin/mappedin-js";
import { getSortedLocations, useMapData } from "@/context/MapDataContext";
import { useSharedMap } from "@/context/SharedMapContext";
import { FLAGS } from "@/constants/flags";
import {
  addLocationLabels,
  fetchCategoryIconSvg,
  prepareCategoryIcons,
  svgToDataUri,
} from "@/utils/mapLabels";

type CameraTransform = Awaited<
  ReturnType<MapViewControl["Camera"]["getFocusOnTransform"]>
>;

// How far the detail screen is allowed to zoom in on a location. Higher =
// closer (mercator zoom levels). Larger than the browse cap so small spaces
// fill the shorter detail map.
const DETAIL_MAX_ZOOM = 18;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMarkerHtml(
  location: EnterpriseLocation,
  categoryIconUri?: string
): string {
  const logoUri = location.logo ?? location.picture;
  let logo: string;
  if (logoUri) {
    logo = `<img src="${logoUri}" style="width:28px;height:28px;border-radius:14px;object-fit:contain;background:#f3f4f6;flex:0 0 auto;" />`;
  } else if (categoryIconUri) {
    logo = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:14px;background:#eef2ff;flex:0 0 auto;"><img src="${categoryIconUri}" style="width:18px;height:18px;object-fit:contain;" /></div>`;
  } else {
    logo = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:14px;background:#eef2ff;flex:0 0 auto;font-size:14px;font-weight:700;color:#2563eb;">${escapeHtml(
      location.name.charAt(0).toUpperCase()
    )}</div>`;
  }

  return `
    <div style="display:flex;align-items:center;gap:8px;max-width:200px;padding:5px 12px 5px 5px;border-radius:20px;background:#ffffff;border:2px solid #2563eb;box-shadow:0 2px 8px rgba(0,0,0,0.35);">
      ${logo}
      <span style="font-size:14px;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(
        location.name
      )}</span>
    </div>
  `;
}

/**
 * The single controller living inside the persistent MapView. It runs the
 * one-time setup (3D models, interactive spaces, category labels, floor list),
 * keeps the shared floor selection in sync, navigates to the detail screen when
 * a space is tapped, and reacts to the selected location by focusing the camera
 * and rendering a marker. It renders nothing except the (optional) marker.
 */
export function MapBrain() {
  const { mapView, mapData } = useMap();
  const { setMapData } = useMapData();
  // Work off the MapView's own (hydrated) MapData via useMap. This is the same
  // instance whether the MapView loaded it itself (MAPVIEW_OWNS_DATA) or we
  // handed it a natively-loaded one, so map operations always target the live
  // instance regardless of the flag.
  const locations = useMemo(
    () => (mapData ? getSortedLocations(mapData) : []),
    [mapData]
  );
  const getLocation = (id: string) =>
    mapData?.getById("enterprise-location", id) ?? undefined;
  const {
    setMapView,
    setFloors,
    setCurrentFloorId,
    selectedLocationId,
    activeHost,
    mapExpanded,
    setMapFocusing,
  } = useSharedMap();
  const router = useRouter();

  const [markerIconUri, setMarkerIconUri] = useState<string | undefined>();
  // Whole-mall overview, captured once on load (fallback for the map screen).
  const overviewRef = useRef<CameraTransform | null>(null);
  // The camera the user last had while browsing the map, snapshotted right
  // before we focus on a location, so we can restore it when they come back.
  const browseCameraRef = useRef<CameraTransform | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);
  const prevExpandedRef = useRef(mapExpanded);

  const selectedLocation = selectedLocationId
    ? getLocation(selectedLocationId)
    : undefined;
  const targetSpace = selectedLocation?.spaces[0];
  const markerTarget = targetSpace ?? selectedLocation?.coordinates[0];

  // When the MapView owns the data load, publish its loaded instance so the
  // directory/detail screens read the same MapData (no native getMapData, no
  // serializing a parsed MapData across the bridge).
  useEffect(() => {
    if (FLAGS.MAPVIEW_OWNS_DATA && mapData) {
      setMapData(mapData);
    }
  }, [mapData, setMapData]);

  useEffect(() => {
    if (!mapView || !mapData) {
      return;
    }
    let cancelled = false;

    setMapView(mapView);
    mapView.Models.all();

    // Make spaces that belong to a location clickable.
    for (const space of mapData.getByType("space")) {
      if (space.enterpriseLocations.length > 0) {
        mapView.updateState(space, { interactive: true });
      }
    }

    const sortedFloors = [...mapData.getByType("floor")].sort(
      (a, b) => b.elevation - a.elevation
    );
    setFloors(sortedFloors);

    (async () => {
      const current = (await mapView.currentFloor) as unknown as
        | Floor
        | undefined;
      if (current && !cancelled) {
        setCurrentFloorId(current.id);
      }
      const whiteIcons = await prepareCategoryIcons(locations);
      if (!cancelled) {
        addLocationLabels(mapView, locations, whiteIcons);
      }
      // Capture an overview transform so we can restore it when browsing.
      try {
        const overview = await mapView.Camera.getFocusOnTransform(
          mapData.getByType("space")
        );
        if (!cancelled) {
          overviewRef.current = overview;
        }
      } catch {
        // Non-fatal; browse mode will simply leave the camera where it is.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapView, mapData, locations, setMapView, setFloors, setCurrentFloorId]);

  useMapViewEvent("floor-change", (event) => {
    setCurrentFloorId(event.floor.id);
  });

  useMapViewEvent("click", (event) => {
    const location = event.spaces?.[0]?.enterpriseLocations?.[0];
    if (!location) {
      return;
    }
    // Tapping a location only navigates from the browse map (map tab). On a
    // location's detail page, the map is non-interactive for navigation.
    if (activeHost !== "map-tab") {
      return;
    }
    router.push(`/location/${location.id}`);
  });

  // Focus the camera on the selected location (instant, top-down, zoomed in),
  // or restore the user's last browse camera (falling back to the overview)
  // when nothing is selected.
  useEffect(() => {
    if (!mapView) {
      return;
    }
    let cancelled = false;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;
    const enteringSelection = Boolean(selectedLocation) && !prevSelectedIdRef.current;
    prevSelectedIdRef.current = selectedLocationId ?? null;

    (async () => {
      if (selectedLocation) {
        // Cover the map with a spinner until the profile's camera view is ready.
        setMapFocusing(true);
        // Snapshot the current camera as we leave browse mode so it can be
        // restored later, before we reparent + move the camera to the target.
        if (enteringSelection) {
          // Camera getters return cached values synchronously even though the
          // bridge types them as Promisify<...>; snapshot them as a transform.
          const cam = mapView.Camera;
          browseCameraRef.current = {
            center: cam.center,
            zoomLevel: cam.zoomLevel,
            bearing: cam.bearing,
            pitch: cam.pitch,
          } as unknown as CameraTransform;
        }
        // Switch to the location's floor FIRST so its space/marker is on the
        // visible floor. Spaces expose a Floor object; coordinate-only locations
        // (no space) only expose a floorId — handle both so we never get stuck
        // showing the wrong floor.
        const targetFloor = targetSpace?.floor;
        const targetFloorId =
          targetFloor?.id ?? selectedLocation.coordinates[0]?.floorId;
        if (targetFloorId) {
          try {
            await mapView.setFloor(targetFloor ?? targetFloorId);
            if (!cancelled) {
              setCurrentFloorId(targetFloorId);
            }
          } catch {
            // Non-fatal; keep the current floor if the switch fails.
          }
        }

        const focusTarget = targetSpace ?? selectedLocation;
        try {
          const transform = await mapView.Camera.getFocusOnTransform(
            focusTarget,
            { maxZoomLevel: DETAIL_MAX_ZOOM, pitch: 0 }
          );
          if (!cancelled) {
            mapView.Camera.set(transform);
          }
        } catch {
          // Focus can fail when a target has no valid coordinates; the floor
          // switch above still applies so the location stays on the right floor.
        }
        // Give the map a beat to paint the focused view before revealing it.
        if (!cancelled) {
          revealTimer = setTimeout(() => {
            if (!cancelled) {
              setMapFocusing(false);
            }
          }, 150);
        }
      } else {
        // Nothing selected (browse mode): no spinner needed.
        setMapFocusing(false);
        const restore = browseCameraRef.current ?? overviewRef.current;
        if (restore && !cancelled) {
          mapView.Camera.set(restore);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (revealTimer) {
        clearTimeout(revealTimer);
      }
    };
  }, [
    mapView,
    selectedLocation,
    targetSpace,
    selectedLocationId,
    setCurrentFloorId,
    setMapFocusing,
  ]);

  // When the detail map is expanded to / collapsed from full screen, the host
  // viewport changes size. Re-fit the camera onto the same location so it stays
  // well-framed for the new viewport. Waits for the host to resize first, since
  // getFocusOnTransform depends on the current viewport dimensions.
  useEffect(() => {
    const changed = prevExpandedRef.current !== mapExpanded;
    const collapsing = changed && !mapExpanded;
    prevExpandedRef.current = mapExpanded;
    if (!changed || !mapView || !selectedLocation) {
      return;
    }
    let cancelled = false;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;
    // Expanding/collapsing resizes the host and re-fits the camera, which looks
    // clunky if shown live. Cover it (fade) until the new view is ready.
    setMapFocusing(true);
    const focusTarget = targetSpace ?? selectedLocation;
    const timer = setTimeout(async () => {
      if (cancelled) {
        return;
      }
      // Collapsing back to the inline map should restore this profile's INITIAL
      // map state, so also reset the floor (the user may have changed floors
      // while full-screen) before re-framing the camera.
      if (collapsing) {
        const targetFloor = targetSpace?.floor;
        const targetFloorId =
          targetFloor?.id ?? selectedLocation.coordinates[0]?.floorId;
        if (targetFloorId) {
          try {
            await mapView.setFloor(targetFloor ?? targetFloorId);
            if (!cancelled) {
              setCurrentFloorId(targetFloorId);
            }
          } catch {
            // Non-fatal; keep the current floor if the switch fails.
          }
        }
      }
      try {
        const transform = await mapView.Camera.getFocusOnTransform(focusTarget, {
          maxZoomLevel: DETAIL_MAX_ZOOM,
          pitch: 0,
        });
        if (!cancelled) {
          mapView.Camera.set(transform);
        }
      } catch {
        // Non-fatal; the camera just stays where it is.
      }
      if (!cancelled) {
        // Reveal (fade out the cover) once the new view has painted.
        revealTimer = setTimeout(() => {
          if (!cancelled) {
            setMapFocusing(false);
          }
        }, 150);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (revealTimer) {
        clearTimeout(revealTimer);
      }
    };
  }, [
    mapExpanded,
    mapView,
    selectedLocation,
    targetSpace,
    setCurrentFloorId,
    setMapFocusing,
  ]);

  // Resolve the marker's category-icon fallback when the location has no logo.
  useEffect(() => {
    const category = selectedLocation?.categories[0];
    const hasLogo = Boolean(selectedLocation?.logo ?? selectedLocation?.picture);
    if (!selectedLocation || hasLogo || !category) {
      setMarkerIconUri(undefined);
      return;
    }
    let cancelled = false;
    fetchCategoryIconSvg(category, category.color ?? "#2563eb").then(
      (markup) => {
        if (!cancelled && markup) {
          setMarkerIconUri(svgToDataUri(markup));
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [selectedLocation]);

  if (selectedLocation && markerTarget) {
    return (
      <Marker
        target={markerTarget}
        html={buildMarkerHtml(selectedLocation, markerIconUri)}
        options={{ rank: "always-visible", placement: "top" }}
      />
    );
  }
  return null;
}
