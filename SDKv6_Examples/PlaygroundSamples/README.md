# Mappedin React Native Samples

[![npm](https://img.shields.io/npm/v/@mappedin/react-native-sdk)](https://www.npmjs.com/package/@mappedin/react-native-sdk)

[![Platform](https://img.shields.io/badge/platform-React%20Native-blue)](https://developer.mappedin.com/react-native-sdk/getting-started) [![Expo](https://img.shields.io/badge/Expo-SDK%2058-purple)](https://expo.dev/)

This repo contains a sample application demonstrating different ways to integrate with the Mappedin SDK for React Native to render maps and build a custom indoor mapping experience. To learn more about ways to integrate with Mappedin, refer to [developer.mappedin.com](https://developer.mappedin.com/).

The Mappedin SDK for React Native enables you to build powerful and highly flexible indoor mapping experiences in React Native applications on iOS and Android.

---

## Getting Started

The application is built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/).

```bash
npm install
npm start
```

Then press `i` for the iOS simulator or `a` for the Android emulator.

Native projects are not committed — Expo generates them on demand with
`npx expo prebuild`.

To read more about the Mappedin SDK for React Native, refer to
[Getting Started with Mappedin SDK for React Native](https://developer.mappedin.com/react-native-sdk/getting-started)
and additional guides in the Mappedin developer docs.

The samples in this repo provide a key and secret to access demo maps. Production apps will need
their own key and secret. Refer to
[Create a Key & Secret](https://developer.mappedin.com/react-native-sdk/getting-started#create-a-key--secret)
for instructions on how to create your own.

## Mappedin SDK for React Native v6 Samples

The following table lists the sample screens that pertain to the latest version of the Mappedin
SDK for React Native.

| **Sample**                     | **Description**                                                                                       | **Guide**                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| [DisplayMapDemo]               | The most basic example to show a map.                                                                 | [Getting Started]                  |
| [AreaShapesDemo]               | Demonstrates using shapes to show areas and route directions around closed areas.                     | [Areas & Shapes]                   |
| [BlueDotDemo]                  | Demonstrates using Blue Dot to show the user's position on the map.                                   | [Blue Dot]                         |
| [BlueDotManualPositioningDemo] | Demonstrates how to report a position to the Mappedin location fusion engine with a confidence score. | [Blue Dot]                         |
| [BlueDotPathTetheringDemo]     | Demonstrates how to tether a navigation path to a user's location (Blue Dot) as they move.            | coming soon                        |
| [BuildingFloorSelectionDemo]   | Demonstrates switching between maps for venues with multiple floors and or multiple buildings.        | [Building & Floor Selection]       |
| [CameraDemo]                   | Demonstrates how to move the camera.                                                                  | [Camera]                           |
| [ColorsAndTexturesDemo]        | Demonstrates how to apply custom colors and textures to the map.                                      | [Images, Textures & Colors]        |
| [DynamicFocusDemo]             | Demonstrates how to use Dynamic Focus.                                                                | [Dynamic Focus]                    |
| [DynamicFocusManualDemo]       | Demonstrates how to create a custom Dynamic Focus effect.                                             | [Custom Dynamic Focus]             |
| [EventsDemo]                   | Demonstrates how to use events created in Mappedin CMS.                                               |                                    |
| [IconsDemo]                    | Demonstrates how use Mappedin icons.                                                                  | [Icons]                            |
| [Image3DDemo]                  | Demonstrates how to add images on a map.                                                              | [Images, Textures & Colors]        |
| [InteractivityDemo]            | Demonstrates how to capture and act on touch events.                                                  | [Interactivity]                    |
| [LabelsDemo]                   | Demonstrates adding rich labels to the map.                                                           | [Labels]                           |
| [LocationsDemo]                | Demonstrates using location profiles and categories.                                                  | [Location Profiles & Categories]   |
| [MarkersDemo]                  | Demonstrates adding HTML Markers to the map.                                                          | [Markers]                          |
| [ModelsDemo]                   | Demonstrates adding 3D models to the map.                                                             | [3D Models]                        |
| [MultiFloorViewDemo]           | Demonstrates using multi floor view.                                                                  | [Multi Floor View & Stacked Maps]  |
| [NavigationDemo]               | Demonstrates wayfinding and navigation across multiple floors.                                        | [Wayfinding]                       |
| [PathsDemo]                    | Demonstrates how to draw a path between two rooms.                                                    | [Wayfinding]                       |
| [QueryDemo]                    | Demonstrates how to find the nearest room based on a coordinate and click event.                      |                                    |
| [ReusableMapDemo]              | Demonstrates how to reuse the same MapView instance on multiple screens for faster loading.           | [Reusing a MapView Across Screens] |
| [SearchDemo]                   | Demonstrates how to use the suggest and search feature.                                               | [Search]                           |
| [StackedMapsDemo]              | Demonstrates how to use the stacked maps.                                                             | [Multi Floor View & Stacked Maps]  |
| [Text3DDemo]                   | Demonstrates how to use Text3D labels.                                                                | [Flat Text]                        |
| [TurnByTurnDemo]               | Demonstrates how to use turn by turn directions.                                                      | [Turn-by-Turn Directions]          |

[DisplayMapDemo]: ./app/display-map.tsx
[AreaShapesDemo]: ./app/areas-shapes.tsx
[BlueDotDemo]: ./app/blue-dot.tsx
[BlueDotManualPositioningDemo]: ./app/blue-dot-manual-positioning.tsx
[BlueDotPathTetheringDemo]: ./app/blue-dot-path-tethering.tsx
[BuildingFloorSelectionDemo]: ./app/building-floor-selection.tsx
[CameraDemo]: ./app/camera.tsx
[ColorsAndTexturesDemo]: ./app/colors-textures.tsx
[DynamicFocusDemo]: ./app/dynamic-focus.tsx
[DynamicFocusManualDemo]: ./app/dynamic-focus-manual.tsx
[EventsDemo]: ./app/events.tsx
[IconsDemo]: ./app/icons.tsx
[Image3DDemo]: ./app/image3d.tsx
[InteractivityDemo]: ./app/interactivity.tsx
[LabelsDemo]: ./app/labels.tsx
[LocationsDemo]: ./app/locations.tsx
[MarkersDemo]: ./app/markers.tsx
[ModelsDemo]: ./app/models.tsx
[MultiFloorViewDemo]: ./app/multi-floor-view.tsx
[NavigationDemo]: ./app/navigation.tsx
[PathsDemo]: ./app/paths.tsx
[QueryDemo]: ./app/query.tsx
[ReusableMapDemo]: ./app/reusable-map-view.tsx
[SearchDemo]: ./app/search.tsx
[StackedMapsDemo]: ./app/stacked-maps.tsx
[Text3DDemo]: ./app/text3d.tsx
[TurnByTurnDemo]: ./app/turn-by-turn.tsx
[MVFv3]: https://developer.mappedin.com/docs/mvf/v3/getting-started
[Getting Started]: https://developer.mappedin.com/react-native-sdk/getting-started
[Areas & Shapes]: https://developer.mappedin.com/react-native-sdk/shapes
[Blue Dot]: https://developer.mappedin.com/react-native-sdk/blue-dot
[Building & Floor Selection]: https://developer.mappedin.com/react-native-sdk/level-selection
[Camera]: https://developer.mappedin.com/react-native-sdk/camera
[Dynamic Focus]: https://developer.mappedin.com/react-native-sdk/dynamic-focus
[Custom Dynamic Focus]: https://developer.mappedin.com/react-native-sdk/dynamic-focus#implementing-dynamic-focus-using-mapview
[Icons]: https://developer.mappedin.com/react-native-sdk/icons
[Images, Textures & Colors]: https://developer.mappedin.com/react-native-sdk/images-textures
[Interactivity]: https://developer.mappedin.com/react-native-sdk/interactivity
[Labels]: https://developer.mappedin.com/react-native-sdk/labels
[Location Profiles & Categories]: https://developer.mappedin.com/react-native-sdk/location-profiles-categories
[Markers]: https://developer.mappedin.com/react-native-sdk/markers
[3D Models]: https://developer.mappedin.com/react-native-sdk/3d-models
[Multi Floor View & Stacked Maps]: https://developer.mappedin.com/react-native-sdk/stacked-maps
[Wayfinding]: https://developer.mappedin.com/react-native-sdk/wayfinding
[Reusing a MapView Across Screens]: https://developer.mappedin.com/react-native-sdk/getting-started#reusing-a-mapview-across-screens
[Search]: https://developer.mappedin.com/react-native-sdk/enterprise-data#search
[Flat Text]: https://developer.mappedin.com/react-native-sdk/labels#flat-labels-with-text3d
[Turn-by-Turn Directions]: https://developer.mappedin.com/react-native-sdk/wayfinding#turn-by-turn-directions

---

## Known Gaps

None. All 30 samples are implemented against the public Mappedin SDK for React Native API.

## Additional Resources

- [Mappedin Developer Site](https://developer.mappedin.com/)
- [Mappedin SDK for React Native Getting Started Guide](https://developer.mappedin.com/react-native-sdk/getting-started)
- [Mappedin SDK for React Native API Docs](https://docs.mappedin.com/react-native-sdk-api/v6/latest/)
- [Release Notes](https://developer.mappedin.com/react-native-sdk/release-notes)
