import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import type { Directions } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

const DEPARTURE = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="#8B4513" opacity="0.2"/><path d="M12 28 L12 22 L18 18 L30 18 L36 22 L36 28 L32 32 L16 32 Z" fill="#8B4513" stroke="#5D2E0F" stroke-width="2"/><rect x="22" y="10" width="4" height="12" fill="#5D2E0F"/><path d="M26 10 L36 14 L26 18" fill="#DC143C"/><circle cx="24" cy="24" r="3" fill="#FFD700"/></svg>`;
const DESTINATION = `<svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="26" fill="#FFD700" opacity="0.2"/><rect x="14" y="24" width="28" height="18" rx="2" fill="#8B4513" stroke="#5D2E0F" stroke-width="2"/><path d="M 14 24 Q 14 18 20 16 L 36 16 Q 42 18 42 24" fill="#6D3913" stroke="#5D2E0F" stroke-width="2"/><path d="M 16 24 Q 16 20 20 18 L 36 18 Q 40 20 40 24" fill="#8B4513"/><rect x="14" y="24" width="28" height="5" fill="#5D2E0F"/><rect x="26" y="24" width="4" height="18" fill="#5D2E0F"/><circle cx="28" cy="33" r="3" fill="#DAA520" stroke="#8B6914" stroke-width="1"/><circle cx="28" cy="33" r="1.5" fill="#5D2E0F"/><circle cx="20" cy="30" r="2.5" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><circle cx="36" cy="30" r="2.5" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><circle cx="18" cy="36" r="2" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><circle cx="38" cy="36" r="2" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><circle cx="24" cy="38" r="2" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><circle cx="32" cy="38" r="2" fill="#FFD700" stroke="#DAA520" stroke-width="1"/></svg>`;
const CONNECTION = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#2C3E50" opacity="0.2"/><circle cx="20" cy="20" r="14" fill="#34495E" stroke="#95A5A6" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="#2C3E50"/><path d="M20 12 L23 20 L20 22 L17 20 Z" fill="#DC143C"/><path d="M20 28 L23 20 L20 18 L17 20 Z" fill="#ECF0F1"/><circle cx="20" cy="20" r="2" fill="#FFD700"/></svg>`;

function NavigationSetup() {
	const { mapData, mapView } = useMap();
	const directions = useRef<Directions | null>(null);
	const [mode, setMode] = useState(1);
	const [status, setStatus] = useState('Finding Oak Meeting Room and Office 211...');

	const draw = useCallback(
		async (next: number) => {
			const route = directions.current;
			if (!route) return;
			await mapView.Navigation.clear();
			const pathOptions = { color: '#4b90e2', displayArrowsOnPath: true, animateDrawing: true };
			if (next === 2) {
				await mapView.Navigation.draw(route, { pathOptions, createMarkers: { departure: false, destination: false } });
			} else if (next === 3) {
				await mapView.Navigation.draw(route, {
					pathOptions,
					createMarkers: {
						departure: { template: DEPARTURE, options: { rank: 'always-visible' } },
						destination: { template: DESTINATION, options: { rank: 'always-visible' } },
						connection: { template: CONNECTION, options: { rank: 'always-visible' } },
					},
				});
			} else {
				await mapView.Navigation.draw(route, { pathOptions });
			}
		},
		[mapView],
	);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const spaces = mapData.getByType('space');
			const origin = spaces.find(space => space.name === 'Oak Meeting Room');
			const destination = spaces.find(space => space.name.startsWith('Office 211'));
			if (!origin || !destination) {
				setStatus('Oak Meeting Room or Office 211 was not found');
				return;
			}
			const route = await mapView.getDirections(origin, destination);
			if (cancelled || !route) {
				setStatus('No route found');
				return;
			}
			directions.current = route;
			await mapView.Camera.focusOn(route.coordinates);
			await draw(1);
			setStatus('Choose a marker option');
		})();
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView, draw]);

	const choose = (next: number) => {
		setMode(next);
		void draw(next);
	};

	return (
		<View style={styles.panel}>
			<Text style={styles.title}>Navigation</Text>
			<Text style={styles.body}>{status}</Text>
			<View style={styles.row}>
				{['Default', 'No Start / End', 'Custom'].map((label, index) => (
					<Pressable
						key={label}
						style={[styles.btn, mode === index + 1 && styles.btnOn]}
						onPress={() => choose(index + 1)}
					>
						<Text style={styles.btnText}>{label}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

export default function NavigationDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Navigation' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '64ef49e662fd90fe020bee61',
		}}>
				<NavigationSetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	panel: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 300,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 8,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	title: { fontSize: 20, fontWeight: '700', color: '#111827' },
	body: { fontSize: 13, color: '#6b7280' },
	row: { flexDirection: 'row', gap: 8 },
	btn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
	btnOn: { backgroundColor: '#dbeafe' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
});
