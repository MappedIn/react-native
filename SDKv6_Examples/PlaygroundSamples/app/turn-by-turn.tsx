import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import type { Directions, Path } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function TurnByTurnSetup() {
	const { mapData, mapView } = useMap();
	const directions = useRef<Directions | null>(null);
	const path = useRef<Path | null>(null);
	const [mode, setMode] = useState<'navigation' | 'path'>('navigation');
	const [status, setStatus] = useState('Finding Lobby and Family Med Lab...');

	const show = async (next: 'navigation' | 'path', route = directions.current) => {
		if (path.current) {
			await mapView.Paths.remove(path.current);
			path.current = null;
		}
		await mapView.Navigation.clear();
		if (!route) return;
		if (next === 'path') {
			path.current = await mapView.Paths.add(route.coordinates, { width: 0.5 });
			return;
		}
		await mapView.Navigation.draw(route);
	};

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const destination = mapData.getByType('space').find(space => space.name === 'Family Med Lab EN-09');
			const origin = mapData.getByType('object').find(object => object.name === 'Lobby');
			if (!origin || !destination) {
				setStatus('Lobby or Family Med Lab EN-09 was not found');
				return;
			}

			void mapView.auto();
			const route = await mapView.getDirections(origin, destination);
			if (cancelled || !route) {
				setStatus('No route found');
				return;
			}
			const instructions = route.instructions;
			for (const [index, instruction] of instructions.entries()) {
				const next = instructions[index + 1];
				const text = escapeHtml(
					index === instructions.length - 1
						? 'You Arrived!'
						: `${instruction.action?.type ?? ''} ${instruction.action?.bearing ?? ''} and go ${Math.round(next?.distance ?? 0)} meters`,
				);
				await mapView.Markers.add(
					instruction.coordinate,
					`<div style="background:white;padding:8px 12px;border-radius:8px;font-size:12px"><p style="margin:0">${text}</p></div>`,
					{ rank: 'always-visible' },
				);
			}
			directions.current = route;
			await show('navigation', route);
			await mapView.Camera.focusOn(route.coordinates.slice(0, 3));
			setStatus(`${instructions.length} instructions`);
		})();
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	return (
		<View style={styles.banner}>
			<Text style={styles.title}>Turn by Turn</Text>
			<Text style={styles.body}>Displays turn-by-turn navigation instructions with markers at each step.</Text>
			<Text style={styles.body}>{status}</Text>
			<View style={styles.row}>
				<Text style={styles.body}>Display Mode</Text>
				{(['navigation', 'path'] as const).map(item => (
					<Pressable
						key={item}
						style={[styles.btn, mode === item && styles.btnOn]}
						onPress={() => {
							setMode(item);
							void show(item);
						}}
					>
						<Text style={styles.btnText}>{item === 'navigation' ? 'Navigation' : 'Path'}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

export default function TurnByTurnDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Turn by Turn' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '67881b4666a208000badecc4',
		}}>
				<TurnByTurnSetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	banner: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 320,
		maxWidth: '92%',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 6,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	title: { fontSize: 20, fontWeight: '700', color: '#111827' },
	body: { fontSize: 13, color: '#6b7280' },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	btn: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
	btnOn: { backgroundColor: '#dbeafe' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
});
