/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {type PropsWithChildren} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import ABWayfinding from './examples/ABWayfinding';
import AddInteractivity from './examples/AddInteractivity';
import BlueDotOnClick from './examples/BlueDotOnClick';
import CameraControls from './examples/CameraControls';
import LevelSelector from './examples/LevelSelector';
import ListCategories from './examples/ListCategories';
import ListLocations from './examples/ListLocations';
import Markers from './examples/Markers';
import RenderMap from './examples/RenderMap';
import Search from './examples/Search';
import Tooltips from './examples/Tooltips';
import Labels from './examples/Labels';
import TurnByTurnDirections from './examples/TurnByTurnDirections';

export type RootStackParams = {
  Home: undefined;
  'Add interactivity': undefined;
  'Render map': undefined;
  Labels: undefined;
  Markers: undefined;
  Tooltips: undefined;
  'Level selector': undefined;
  'Blue Dot onClick': undefined;
  'List locations': undefined;
  'List categories': undefined;
  'A-B wayfinding': undefined;
  'Camera controls': undefined;
  'Turn-by-turn directions': undefined;
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();

const ExampleLink: React.FC<
  PropsWithChildren<{
    title: string;
    onPress: () => void;
  }>
> = ({children, title, onPress}) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, styles.black]}>{title}</Text>
        <Text style={[styles.sectionDescription, styles.almostBlack]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
};

// See https://reactnavigation.org/docs/typescript/
const BasicView = ({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Home'>) => {
  return (
    <SafeAreaView style={styles.fullView}>
      <StatusBar barStyle={'light-content'} />
      <ScrollView contentInsetAdjustmentBehavior={'automatic'}>
        <View>
          <ExampleLink
            title="Render a map"
            onPress={() => navigation.navigate('Render map')}>
            Basic venue loading and map rendering
          </ExampleLink>
          <ExampleLink
            title="Adding interactivity"
            onPress={() => navigation.navigate('Add interactivity')}>
            Make locations clickable with{' '}
            <Text style={styles.inlineCode}>onClick</Text> -callback
          </ExampleLink>
          <ExampleLink
            title="Labels"
            onPress={() => navigation.navigate('Labels')}>
            Adding Flat or Floating Labels to your locations
          </ExampleLink>
          <ExampleLink
            title="Markers"
            onPress={() => navigation.navigate('Markers')}>
            Adding HTML markers to the map view
          </ExampleLink>
          <ExampleLink
            title="Tooltips"
            onPress={() => navigation.navigate('Tooltips')}>
            Adding clickable HTML tooltips to the map view
          </ExampleLink>
          <ExampleLink
            title="A-B navigation"
            onPress={() => navigation.navigate('A-B wayfinding')}>
            Get directions from A to B displayed on the map
          </ExampleLink>
          <ExampleLink
            title="Blue Dot onClick"
            onPress={() => navigation.navigate('Blue Dot onClick')}>
            Display the Blue Dot and move it by tapping on the map
          </ExampleLink>
          <ExampleLink
            title="Camera controls"
            onPress={() => navigation.navigate('Camera controls')}>
            Set, animate or focus the camera on a set of map objects
          </ExampleLink>
          <ExampleLink
            title="List locations"
            onPress={() => navigation.navigate('List locations')}>
            List locations of a venue without rendering the map
          </ExampleLink>
          <ExampleLink
            title="List categories"
            onPress={() => navigation.navigate('List categories')}>
            List locations in sectioned by category
          </ExampleLink>
          <ExampleLink
            title="Level selector"
            onPress={() => navigation.navigate('Level selector')}>
            Add a level selector
          </ExampleLink>
          <ExampleLink
            title="Turn-by-turn directions"
            onPress={() => navigation.navigate('Turn-by-turn directions')}>
            Display text-based turn-by-turn directions
          </ExampleLink>
          <ExampleLink
            title="Search"
            onPress={() => navigation.navigate('Search')}>
            Search locations within a venue
          </ExampleLink>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={BasicView}
          options={{title: 'Mappedin examples'}}
        />
        <Stack.Screen
          name="Render map"
          component={RenderMap}
          options={{title: 'Render a map'}}
        />
        <Stack.Screen
          name="Add interactivity"
          component={AddInteractivity}
          options={{title: 'Adding interactivity'}}
        />
        <Stack.Screen
          name="Labels"
          component={Labels}
          options={{title: 'Labels'}}
        />
        <Stack.Screen
          name="Markers"
          component={Markers}
          options={{title: 'Markers'}}
        />
        <Stack.Screen
          name="Tooltips"
          component={Tooltips}
          options={{title: 'Tooltips'}}
        />
        <Stack.Screen
          name="A-B wayfinding"
          component={ABWayfinding}
          options={{title: 'A-B wayfinding'}}
        />
        <Stack.Screen
          name="Camera controls"
          component={CameraControls}
          options={{title: 'Camera Controls'}}
        />
        <Stack.Screen
          name="Level selector"
          component={LevelSelector}
          options={{title: 'Level selector'}}
        />
        <Stack.Screen
          name="Blue Dot onClick"
          component={BlueDotOnClick}
          options={{title: 'Blue Dot onClick'}}
        />
        <Stack.Screen
          name="List locations"
          component={ListLocations}
          options={{title: 'Location list'}}
        />
        <Stack.Screen
          name="List categories"
          component={ListCategories}
          options={{title: 'Categories list'}}
        />
        <Stack.Screen
          name="Turn-by-turn directions"
          component={TurnByTurnDirections}
          options={{title: 'Turn-by-Turn Directions'}}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{title: 'Search'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  black: {
    color: 'black',
  },
  almostBlack: {
    color: '#282828',
  },
  inlineCode: {
    fontWeight: 'bold',
  },
});

export default App;
