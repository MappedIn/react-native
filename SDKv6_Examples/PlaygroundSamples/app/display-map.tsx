import { Stack } from 'expo-router';
import { MapScreen } from '../components/map-screen';

export default function DisplayMap() {
	return (
		<>
			<Stack.Screen options={{ title: 'Display a Map' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '660c0c6e7c0c4fe5b4cc484c',
		}} />
		</>
	);
}
