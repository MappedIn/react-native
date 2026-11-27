# Mappedin SDK for React Native v6 Beta Examples

This repository contains comprehensive examples demonstrating the **Mappedin SDK for React Native v6 Beta** - a powerful indoor mapping solution for React Native applications.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **React Native CLI** or **Expo CLI**
- **iOS Development**: Xcode 14+ (for iOS development)
- **Android Development**: Android Studio (for Android development)
- **React Native Environment Setup**: Complete the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) guide

### Installation

1. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the development server**

   ```bash
   npm start
   # or
   yarn start
   ```

3. **Run on your preferred platform**

   ```bash
   # iOS
   npm run ios
   # or
   yarn ios

   # Android
   npm run android
   # or
   yarn android
   ```

## 📱 Mappedin SDK for React Native Examples

To read more about the Mappedin SDK for React Native, refer to [Getting Started with Mappedin SDK for React Native](https://developer.mappedin.com/react-native-sdk/getting-started) and additional guides in the Mappedin developer docs.

The sample projects in this repo provide a client Id and client secret to access demo venues. Production apps will need their own unique client ID and client secret.

The following table lists the sample applications that pertain to the latest version of the Mappedin SDK for React Native. The activity name matches the sample name.

| **Sample Name**              | **Description**                                                                                                                                                                        | **Guide**                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Basic                        | This example demonstrates map initialization with stacked maps expansion and automatic space touring with camera animations.                                                           | [Getting Started with Mappedin SDK for React Native](https://developer.mappedin.com/react-native-sdk/getting-started) |
| Enterprise                   | This example demonstrates loading a Mappedin CMS map, initializing stacked maps and automatic space touring with camera animations.                                                    | [Getting Started with Mappedin SDK for React Native](https://developer.mappedin.com/react-native-sdk/getting-started) |
| Interactivity                | This example demonstrates interactive map features using the useEvent hook. Click on spaces to focus the camera, add markers with space names, and remove markers by clicking on them. | [Interactivity](https://developer.mappedin.com/react-native-sdk/interactivity)                                        |
| Markers                      | This example showcases various ways to use the Marker component, including dynamic updates to content and properties, marker repositioning, and handling click events.                 | [Markers](https://developer.mappedin.com/react-native-sdk/markers)                                                    |
| Labels                       | This example demonstrates various ways to use the Label component, including dynamic updates to content and properties, showing/hiding labels, and handling click events.              | [Labels](https://developer.mappedin.com/react-native-sdk/labels)                                                      |
| Directions                   | This example demonstrates how to get directions between spaces and display the path with markers.                                                                                      | Coming Soon                                                                                                           |
| Directions Multi Destination | This example demonstrates how to get directions between multiple spaces and display the path with markers.                                                                             | Coming Soon                                                                                                           |
| Paths                        | This example demonstrates how to display navigation paths between spaces with interactive controls.                                                                                    | Coming Soon                                                                                                           |
| 3D Models                    | This example demonstrates how to place interactive 3D models on the map that can be selected and moved.                                                                                | Coming Soon                                                                                                           |
| Custom Shapes                | This example demonstrates how to display custom 3D geometry on the map with various styling options and interactive controls.                                                          | Coming Soon                                                                                                           |
| BlueDot Multi-floor          | This example demonstrates BlueDot navigation across multiple floors, following a predefined path with real-time position updates.                                                      | Coming Soon                                                                                                           |

## 🛠️ Project Structure

```
PlaygroundSamples/
├── app/                          # Example screens
│   ├── index.tsx                # Main navigation hub
│   ├── basic.tsx                # Basic map implementation
│   ├── enterprise.tsx           # Enterprise map features
│   ├── interactivity.tsx        # Event handling examples
│   ├── markers.tsx              # Marker management
│   ├── labels.tsx               # Label system
│   ├── directions.tsx           # Single destination routing
│   ├── directions-multi-destination.tsx  # Multi-stop routing
│   ├── paths.tsx                # Path visualization
│   ├── models.tsx               # 3D model placement
│   ├── shapes.tsx               # Custom geometry
│   ├── bluedot-multi-floor.tsx  # Multi-floor navigation
│   └── _layout.tsx              # App layout configuration
├── assets/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 📚 SDK Documentation

- **[Mappedin SDK for React Native Developer Guides](https://developer.mappedin.com/react-native-sdk/getting-started)**
- **[Mappedin SDK for React Native API Documentation](https://docs.mappedin.com/react-native-sdk-api/v6/latest/)**
- **[Demo Keys and Maps](https://developer.mappedin.com/docs/demo-keys-and-maps)**

## Getting Help

<<<<<<< Updated upstream

- Visit the [Mappedin Developer Community](https://community.mappedin.com/)
- # Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
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
| [QueryDemo]                    | Demonstrates how to find the nearest room based on a coordinate and click event.                      | [Events]                           |
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
[Reusing a MapView Across Screens]: https://developer.mappedin.com/react-native-sdk/getting-started#reusing-a-single-mapview-across-screens
[Search]: https://developer.mappedin.com/react-native-sdk/enterprise-data#enterprise-search
[Flat Text]: https://developer.mappedin.com/react-native-sdk/labels#flat-labels-with-text3d
[Turn-by-Turn Directions]: https://developer.mappedin.com/react-native-sdk/wayfinding#turn-by-turn-directions
[Events]: https://developer.mappedin.com/react-native-sdk/enterprise-data#events--deals

---

## Known Gaps

None. All 30 samples are implemented against the public Mappedin SDK for React Native API.

## Additional Resources

- [Mappedin Developer Site](https://developer.mappedin.com/)
- [Mappedin SDK for React Native Getting Started Guide](https://developer.mappedin.com/react-native-sdk/getting-started)
- [Mappedin SDK for React Native API Docs](https://docs.mappedin.com/react-native-sdk-api/v6/latest/)
- [Release Notes](https://developer.mappedin.com/react-native-sdk/release-notes)
  > > > > > > > Stashed changes
