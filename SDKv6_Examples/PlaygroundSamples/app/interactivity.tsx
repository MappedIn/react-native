import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

function InteractivitySetup() {
	const { mapData, mapView } = useMap();
	const [message, setMessage] = useState('Click or long-press on labels, spaces, and paths.');

	useEffect(() => {
		let cancelled = false;
		(async () => {
			for (const space of mapData.getByType('space')) {
				if (cancelled) return;
				await mapView.updateState(space, { interactive: true } as never);
				if (space.name) await mapView.Labels.add(space, space.name, { interactive: true });
			}
			const locations = mapData.getByType('enterprise-location');
			const find = (name: string) => locations.find(location => location.name === name);
			const microsoft = find('Microsoft');
			const apple = find('Apple');
			if (microsoft && apple) {
				const directions = await mapView.getDirections(microsoft, apple);
				if (!cancelled && directions) {
					await mapView.Navigation.draw(directions, { pathOptions: { interactive: true } });
				}
			}
			const uniqlo = find('Uniqlo');
			const nespresso = find('Nespresso');
			if (uniqlo && nespresso) {
				const directions = await mapView.getDirections(uniqlo, nespresso);
				if (!cancelled && directions?.coordinates?.length) {
					await mapView.Paths.add(directions.coordinates, { interactive: true } as never);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	const report = (
		kind: string,
		event: {
			coordinate: { latitude: number; longitude: number };
			floors?: { name: string }[];
			labels?: { text: string }[];
			spaces?: { name: string }[];
			paths?: unknown[];
		},
	) => {
		const parts = [event.floors?.[0]?.name ?? kind];
		parts.push(`${event.coordinate.latitude.toFixed(6)}, ${event.coordinate.longitude.toFixed(6)}`);
		if (event.labels?.[0]) parts.push(`Label: ${event.labels[0].text}`);
		if (event.spaces?.[0]) parts.push(`Space: ${event.spaces[0].name}`);
		if (event.paths?.length) parts.push('You clicked a path.');
		setMessage(parts.join('\n'));
	};

	useMapViewEvent('click', event => report('Map Click', event));
	useMapViewEvent('long-press', event => report('Map Long Press', event));

	return (
		<View style={styles.card} pointerEvents="none">
			<Text style={styles.title}>Interactivity</Text>
			<Text style={styles.body}>{message}</Text>
		</View>
	);
}

export default function InteractivityDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Interactivity' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: '5eab30aa91b055001a68e996',
			secret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
			mapId: 'mappedin-demo-mall',
		}}>
				<InteractivitySetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 280,
		minHeight: 88,
		borderRadius: 10,
		padding: 12,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	title: { fontSize: 14, fontWeight: '700', color: '#111827' },
	body: { fontSize: 13, color: '#374151', marginTop: 4 },
});
