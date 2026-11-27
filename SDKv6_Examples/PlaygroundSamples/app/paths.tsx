import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import type { Space } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

function PathsSetup() {
	const { mapData, mapView } = useMap();
	const start = useRef<Space | null>(null);
	const [instruction, setInstruction] = useState('1. Click on a space to select it as the starting point.');

	useEffect(() => {
		for (const space of mapData.getByType('space')) {
			void mapView.updateState(space, { interactive: true } as never);
		}
	}, [mapData, mapView]);

	const reset = useCallback(async () => {
		start.current = null;
		await mapView.Paths.removeAll();
		setInstruction('1. Click on a space to select it as the starting point.');
	}, [mapView]);

	useMapViewEvent('click', event => {
		const space = event.spaces?.[0];
		if (!start.current) {
			if (!space) return;
			start.current = space;
			setInstruction('2. Click on another space to select it as the end point.');
			return;
		}
		if (!space || space.id === start.current.id) {
			void reset();
			return;
		}
		const from = start.current;
		void (async () => {
			const directions = await mapView.getDirections(from, space);
			if (!directions?.coordinates?.length) {
				setInstruction('No route found. Click to start again.');
				start.current = null;
				return;
			}
			await mapView.Paths.add(directions.coordinates, { color: '#4b90e2' });
			setInstruction('3. Click anywhere to remove the path.');
			start.current = null;
		})();
	});

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.title}>Paths</Text>
			<Text style={styles.body}>{instruction}</Text>
		</View>
	);
}

export default function PathsDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Paths' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '65c0ff7430b94e3fabd5bb8c',
		}}>
				<PathsSetup />
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
