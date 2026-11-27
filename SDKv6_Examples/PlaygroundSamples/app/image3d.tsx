import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import type { Space } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

const IMAGES = [
	'https://developer.mappedin.com/examples/web-sdk/6.0/images/arena-hockey.png',
	'https://developer.mappedin.com/examples/web-sdk/6.0/images/arena-basketball.png',
	'https://developer.mappedin.com/examples/web-sdk/6.0/images/arena-concert.png',
];
const PIXELS_TO_METERS = 0.0617;

function Image3DSetup() {
	const { mapData, mapView } = useMap();
	const arena = useRef<Space | null>(null);
	const [status, setStatus] = useState('Tap a sport to place its image.');

	const show = async (index: number) => {
		const floor = arena.current;
		const url = IMAGES[index];
		if (!floor || !url) return;
		await mapView.Image3D.removeAll();
		await mapView.Image3D.add(floor, url, {
			width: 1014 * PIXELS_TO_METERS,
			height: 448 * PIXELS_TO_METERS,
			rotation: 239,
			verticalOffset: 1,
			flipImageToFaceCamera: false,
			interactive: true,
		});
		setStatus(`Showing image ${index + 1}`);
	};

	useEffect(() => {
		const floor = mapData.getByType('space').find(space => space.name === 'Arena Floor') ?? null;
		arena.current = floor;
		if (!floor) {
			setStatus('Arena Floor was not found');
			return;
		}
		for (const space of mapData.getByType('space')) {
			if (space.name) void mapView.Labels.add(space, space.name, { interactive: true });
		}
		void show(0);
		// show closes over the current mapView.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapData, mapView]);

	useMapViewEvent('click', event => {
		const image = event.images?.[0];
		if (image) setStatus(`Clicked Image3D: ${image.id}`);
	});

	return (
		<View style={styles.panel}>
			<Text style={styles.body}>{status}</Text>
			<View style={styles.row}>
				{['Hockey', 'Basketball', 'Concert'].map((label, index) => (
					<Pressable key={label} style={styles.btn} onPress={() => show(index)}>
						<Text style={styles.btnText}>{label}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

export default function Image3DDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Image3D' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '672a6f4f3a45ba000b893e1c',
		}}>
				<Image3DSetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	panel: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 280,
		borderRadius: 10,
		padding: 12,
		gap: 8,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	body: { fontSize: 13, color: '#374151' },
	row: { flexDirection: 'row', gap: 8 },
	btn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
});
