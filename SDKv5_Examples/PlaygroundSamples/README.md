# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Mappedin SDK for React Native Examples

To read more about the Mappedin SDK for React Native, refer to [Getting Started with Mappedin SDK for React Native](https://developer.mappedin.com/react-native-sdk/getting-started) and additional guides in the Mappedin developer docs.

The sample projects in this repo provide a client Id and client secret to access demo venues. Production apps will need their own unique client ID and client secret. Contact your Mappedin representative in order to obtain identifiers for your venues.

The following table list the sample applications that pertain to the latest version of the Mappedin SDK for React Native. PlaygroundSamples lists the activity name after the sample name.

| **Sample Name**                     | **Description**                                                                                                            | **Guide**                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ABWayfinding                        | Demonstrates drawing directions on the map from one location to another.                                                   | [Wayfinding](https://developer.mappedin.com/react-native-sdk/wayfinding)                                                                                         |
| AddInteractivity                    | Demonstrates capturing when a user touches a polygon and changes the polygon color.                                        | [Interactivity](https://developer.mappedin.com/react-native-sdk/interactivity)                                                                                   |
| BlueDot                             | Demonstrates showing the user's location on the map as a blue dot. Uses clicked location coordinates to simulate movement. | [Blue Dot](https://developer.mappedin.com/react-native-sdk/blue-dot)                                                                                             |
| CameraControls                      | Demonstrates moving the camera to change the way the map is viewed.                                                        | [Camera Controls](https://developer.mappedin.com/react-native-sdk/camera)                                                                                        |
| Labels                              | Demonstrates displaying and changing the style of flat and floating labels.                                                | [Floating Labels](https://developer.mappedin.com/react-native-sdk/floating-labels) or [Flat Labels](https://developer.mappedin.com/react-native-sdk/flat-labels) |
| Playground Samples - Level Selector | Demonstrates switching between maps for venues with multiple floors.                                                       | [Level Selection](https://developer.mappedin.com/react-native-sdk/level-selector)                                                                                |
| List Categories                     | Demonstrates listing all categories for a venue.                                                                           |                                                                                                                                                                  |
| List Locations                      | Demonstrates getting the name, description and icon for all locations and displaying them in a list.                       | [Locations](https://developer.mappedin.com/react-native-sdk/locations)                                                                                           |
| Markers                             | Demonstrates placing markers on the map where a user touches.                                                              | [Markers](https://developer.mappedin.com/react-native-sdk/markers)                                                                                               |
| Render Map                          | Demonstrates displaying a map.                                                                                             | [Getting Started with Mappedin SDK for React Native](https://developer.mappedin.com/react-native-sdk/getting-started)                                            |
| Search                              | Demonstrates a text search for a location name.                                                                            | [Search](https://developer.mappedin.com/react-native-sdk/search)                                                                                                 |
| Tooltips                            | Demonstrates using tooltips to display information on a map.                                                               | [Tooltips](https://developer.mappedin.com/react-native-sdk/tooltips)                                                                                             |
| Turn By Turn Directions             | Demonstrates retrieving and showing turn by turn directions between two points on the map.                                 | [Turn by Turn Directions](https://developer.mappedin.com/react-native-sdk/directions)                                                                            |

## Getting Help

- Visit the [Mappedin Developer Community](https://community.mappedin.com/)
- Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)

# Learn More

- [Mappedin React Native Developer Guides](https://developer.mappedin.com/react-native-sdk/latest/getting-started/)
- [Mappedin React Native API Docs](https://developer.mappedin.com/react-native-sdk-api/v5/)
