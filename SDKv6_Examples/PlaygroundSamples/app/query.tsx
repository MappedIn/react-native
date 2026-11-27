import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { Coordinate, type Space } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

function QuerySetup() {
	const { mapData, mapView } = useMap();
	const [useAt, setUseAt] = useState(false);
	const [status, setStatus] = useState('Click on the map to query.');
	const highlighted = useRef<{ space: Space; color?: string } | null>(null);

	const highlight = async (space: Space | undefined, label: string) => {
		if (highlighted.current) {
			await mapView.updateState(highlighted.current.space, { color: highlighted.current.color } as never);
			highlighted.current = null;
		}
		if (!space) {
			setStatus(label);
			return;
		}
		const previous = await mapView.getState(space);
		highlighted.current = { space, color: (previous as { color?: string } | undefined)?.color };
		await mapView.updateState(space, { color: '#f59e0b' } as never);
		setStatus(label);
	};

	useMapViewEvent('click', event => {
		void (async () => {
			const coordinate = new Coordinate({
				latitude: event.coordinate.latitude,
				longitude: event.coordinate.longitude,
				floorId: event.coordinate.floorId ?? event.floors?.[0]?.id,
			});
			if (useAt) {
				const hits = await mapData.Query.at(coordinate);
				const space = hits?.find(hit => (hit as { __type?: string }).__type === 'space') as Space | undefined;
				await highlight(
					space,
					space
						? `Highlighted: ${space.name} (${hits?.length ?? 0} geometry at point)`
						: `No space at click. ${hits?.length ?? 0} geometry found.`,
				);
				return;
			}
			const nearest = await mapData.Query.nearest(coordinate, mapData.getByType('space'));
			const hit = nearest?.[0];
			await highlight(
				hit?.feature,
				hit ? `Highlighted: ${hit.feature.name} (${hit.distance.toFixed(1)}m away)` : 'No space found near click location.',
			);
		})();
	});

	return (
		<View style={styles.panel}>
			<Text style={styles.body}>{status}</Text>
			<View style={styles.row}>
				<Pressable style={[styles.btn, !useAt && styles.btnOn]} onPress={() => setUseAt(false)}>
					<Text style={styles.btnText}>Nearest</Text>
				</Pressable>
				<Pressable style={[styles.btn, useAt && styles.btnOn]} onPress={() => setUseAt(true)}>
					<Text style={styles.btnText}>At</Text>
				</Pressable>
			</View>
		</View>
	);
}

export default function QueryDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Query' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '660c0bb9ae0596d87766f2d9',
		}}>
				<QuerySetup />
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
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 8,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	body: { fontSize: 13, color: '#374151' },
	row: { flexDirection: 'row', gap: 8 },
	btn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
	btnOn: { backgroundColor: '#dbeafe' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
});
