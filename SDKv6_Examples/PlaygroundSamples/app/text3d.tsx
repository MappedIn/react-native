import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

const COLORS = ['#111827', '#b91c1c', '#1d4ed8', '#047857', '#b45309'];

function pick<T>(values: T[]): T {
	return values[Math.floor(Math.random() * values.length)];
}

function Text3DSetup() {
	const { mapView } = useMap();

	useMapViewEvent('click', event => {
		// The click coordinate is already on the floor surface. Add 1m so the text
		// sits above it instead of inside the floor.
		void mapView.Text3D.add(
			{
				__type: 'coordinate',
				latitude: event.coordinate.latitude,
				longitude: event.coordinate.longitude,
				floorId: event.coordinate.floorId ?? event.floors?.[0]?.id,
				verticalOffset: (event.coordinate.verticalOffset ?? 0) + 1,
			} as never,
			'Hello, world!',
			{
				appearance: {
					color: pick(COLORS),
					fontSize: 1 + Math.random() * 2,
					outlineWidth: Math.random() * 0.2,
					outlineColor: pick(COLORS),
				},
				rotation: Math.floor(Math.random() * 360),
			} as never,
		);
	});

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.title}>Text3D</Text>
			<Text style={styles.body}>Click anywhere on the map to place text with random appearance settings.</Text>
		</View>
	);
}

export default function Text3DDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Text3D' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '6679882a8298d5000b85ee89',
		}}>
				<Text3DSetup />
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
	title: { fontSize: 20, fontWeight: '700', color: '#111827' },
	body: { fontSize: 13, color: '#6b7280', marginTop: 2 },
});
