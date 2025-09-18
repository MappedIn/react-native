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

- Visit the [Mappedin Developer Community](https://community.mappedin.com/)
- Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
