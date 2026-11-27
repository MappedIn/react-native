import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function MarkersSetup() {
	const { mapData, mapView } = useMap();

	useEffect(() => {
		let cancelled = false;
		(async () => {
			for (const annotation of mapData.getByType('annotation')) {
				if (cancelled) return;
				const iconUrl = annotation.icon?.url;
				if (!iconUrl) continue;
				await mapView.Markers.add(
					annotation,
					`<div style="width:30px;height:30px"><img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(annotation.name ?? '')}" width="30" height="30"/></div>`,
					{ interactive: true, rank: 'high' },
				);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	useMapViewEvent('click', event => {
		const marker = event.markers?.[0];
		if (marker) void mapView.Markers.remove(marker);
	});

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.title}>Markers</Text>
			<Text style={styles.body}>Markers are added to show annotations on the map. Click a marker to remove it.</Text>
		</View>
	);
}

export default function MarkersDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Markers' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '67a6641530e940000bac3c1a',
		}}>
				<MarkersSetup />
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
