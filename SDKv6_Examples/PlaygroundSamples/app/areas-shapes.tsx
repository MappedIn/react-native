import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

const MAP_OPTIONS = { outdoorView: { enabled: true } };

function AreasAndShapes() {
	const { mapData, mapView } = useMap();
	const [humanSafePath, setHumanSafePath] = useState(false);
	const [status, setStatus] = useState('Loading areas...');
	const [ready, setReady] = useState(false);

	// Draw the two areas as shapes and label them.
	useEffect(() => {
		let cancelled = false;

		(async () => {
			const areas = mapData.getByType('area');

			const forklift = areas.find(a => a.name === 'Forklift Area');
			const maintenance = areas.find(a => a.name === 'Maintenance Area');

			// Shapes.add takes a FeatureCollection; Area.geoJSON is a single Feature.
			const asCollection = (area: { geoJSON: unknown }) => ({
				type: 'FeatureCollection' as const,
				features: [area.geoJSON],
			});

			if (forklift) {
				await mapView.Shapes.add(asCollection(forklift) as never, {
					color: 'red',
					opacity: 0.7,
					altitude: 0.2,
					height: 0.1,
				});
				await mapView.Labels.add(forklift, 'Maintenance Area', { rank: 'always-visible' });
			}

			if (maintenance) {
				await mapView.Shapes.add(asCollection(maintenance) as never, {
					color: 'orange',
					opacity: 0.7,
					altitude: 0.2,
					height: 1.0,
				});
				await mapView.Labels.add(maintenance, 'Forklift Area', { rank: 'always-visible' });
			}

			if (!cancelled) {
				setStatus(
					!forklift && !maintenance
						? 'No Forklift/Maintenance areas on this map'
						: 'Areas drawn. Toggle to re-route.',
				);
				setReady(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	// Route between the two endpoints, optionally avoiding the maintenance zone.
	const drawPath = useCallback(
		async (avoidZone: boolean) => {
			await mapView.Paths.removeAll();

			const origin = mapData.getByType('object').find(o => o.name === 'I3');
			const destination = mapData.getByType('door').find(d => d.name === 'Outbound Shipments 1');

			if (!origin || !destination) {
				setStatus('Route endpoints not found on this map');
				return;
			}

			const maintenanceArea = mapData.getByType('area').find(a => a.name === 'Maintenance Area');
			const options =
				avoidZone && maintenanceArea
					? { zones: [{ geometry: maintenanceArea.geoJSON, cost: Number.MAX_VALUE, floor: maintenanceArea.floor }] }
					: undefined;

			const directions = await mapView.getDirections(origin as never, destination as never, options);

			if (!directions || !directions.coordinates?.length) {
				setStatus('No route found between I3 and Outbound Shipments 1');
				return;
			}

			await mapView.Paths.add(
				'coordinates' in directions ? directions.coordinates : [],
				{ color: avoidZone ? 'cornflowerblue' : 'green' },
			);
			setStatus(avoidZone ? 'Routing around the zone' : 'Direct route');
		},
		[mapData, mapView],
	);

	useEffect(() => {
		if (ready) void drawPath(false);
	}, [ready, drawPath]);

	const onToggle = useCallback(
		(value: boolean) => {
			setHumanSafePath(value);
			void drawPath(value);
		},
		[drawPath],
	);

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Text style={styles.title}>Areas &amp; Shapes</Text>
				<Text style={styles.description}>
					Demonstrates drawing shapes from areas, labeling them, and routing with zone avoidance.
				</Text>
				<Text style={styles.status}>{status}</Text>
			</View>
			<View style={styles.toggleRow}>
				<Text style={styles.toggleLabel}>Human Safe Path</Text>
				<Switch value={humanSafePath} onValueChange={onToggle} />
			</View>
		</View>
	);
}

export default function AreasShapesDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Areas & Shapes' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '667b26b38298d5000b85eeb0',
		}} options={MAP_OPTIONS}>
				<AreasAndShapes />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 320,
		maxWidth: '92%',
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 10,
	},
	title: { fontSize: 20, fontWeight: '700', color: '#111827' },
	description: { fontSize: 13, color: '#6b7280', marginTop: 2 },
	status: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
	toggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f3f4f6',
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	toggleLabel: { fontSize: 14, color: '#111827' },
});
