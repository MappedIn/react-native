import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DOORS, WALLS } from '@mappedin/mappedin-js';
import { useMap } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

const WALL_URL = 'https://developer.mappedin.com/examples/web-sdk/6.0/textures/exterior-wall.jpg';
const FLOOR_URL = 'https://developer.mappedin.com/examples/web-sdk/6.0/textures/floor.png';
const SIDE_URL = 'https://developer.mappedin.com/examples/web-sdk/6.0/textures/object-side.jpg';

function ColorsSetup() {
	const { mapData, mapView } = useMap();
	const [status, setStatus] = useState('Loading textures...');

	useEffect(() => {
		let cancelled = false;
		(async () => {

			await mapView.updateState(DOORS.Interior, { visible: true, color: 'brown', topColor: 'yellow', opacity: 0.6 } as never);
			await mapView.updateState(DOORS.Exterior, { visible: true, color: 'black', topColor: 'blue', opacity: 0.6 } as never);
			await mapView.updateState(WALLS.Interior, { color: '#526D82', topColor: '#27374D' } as never);
			await mapView.updateState(WALLS.Exterior, { texture: { url: WALL_URL }, topTexture: { url: WALL_URL } } as never);

			for (const space of mapData.getByType('space')) {
				if (cancelled) return;
				await mapView.updateState(space, { topTexture: { url: FLOOR_URL } } as never);
			}
			for (const object of mapData.getByType('object')) {
				if (cancelled) return;
				await mapView.updateState(object, { texture: { url: SIDE_URL }, topColor: '#9DB2BF' } as never);
			}
			setStatus('Textures applied');
		})();
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.body}>{status}</Text>
		</View>
	);
}

export default function ColorsTexturesDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Colors & Textures' }} />
			<MapScreen
				mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '64ef49e662fd90fe020bee61',
		}}
				options={{ outdoorView: { style: 'https://tiles-cdn.mappedin.com/styles/midnightblue/style.json' }, shadingAndOutlines: false }}
			>
				<ColorsSetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	banner: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 280,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	body: { fontSize: 13, color: '#374151' },
});
