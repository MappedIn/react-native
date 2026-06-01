/**
 * Experimental feature flags. Flip these to try alternative UX without ripping
 * out the other approach.
 */
export const FLAGS = {
  /**
   * Where the venue data is loaded.
   *
   * true (default): the MapView's WebView loads + hydrates the data itself
   * (from the loading options). MapBrain reads the loaded MapData back out via
   * useMap() and publishes it to MapDataContext for the directory/detail
   * screens. This avoids serializing a fully-parsed MapData across the RN bridge
   * into the WebView (and re-hydrating it there), which is slower.
   *
   * false: load the data natively in React Native with getMapData and pass the
   * MapData instance into the MapView (the SDK then serializes it over the
   * bridge to the WebView to hydrate).
   */
  MAPVIEW_OWNS_DATA: true,
  /**
   * Hide the "Map" tab from the tab bar entirely. The shared MapView still
   * mounts and loads upfront (kept warm in the off-screen "parking" host), so it
   * is ready to reparent into location detail pages instantly. When false, the
   * Map tab is shown as usual.
   */
  HIDE_MAP_TAB: true,
  /**
   * Keep the launch loading screen up until the map's WebView has fully loaded
   * (MapView onMapReady). When false, the app shows immediately and a spinner is
   * shown over the map the first time it loads on a screen, then never again
   * (the map is persistent, so it only loads once).
   */
  WAIT_FOR_MAP_ON_LAUNCH: true,
} as const;
