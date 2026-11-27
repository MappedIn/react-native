import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

const SCREENS = ['Screen 1', 'Screen 2', 'Screen 3'];

function ScreenSwitcher() {
	const { mapData, mapView } = useMap();
	const [index, setIndex] = useState(0);
	const spaces = mapData.getByType('space').filter(space => space.name);
	const targets = [spaces[0], spaces[Math.floor(spaces.length / 2)], spaces[spaces.length - 1]].filter(Boolean);

	const show = (next: number) => {
		setIndex(next);
		const space = targets[next];
		if (space) void mapView.Camera.focusOn(space);
	};

	return (
		<View style={styles.panel}>
			<Text style={styles.body}>{targets[index]?.name ?? 'Loading spaces...'}</Text>
			<View style={styles.row}>
				{SCREENS.map((label, screen) => (
					<Pressable key={label} style={[styles.btn, index === screen && styles.btnOn]} onPress={() => show(screen)}>
						<Text style={styles.btnText}>{label}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

export default function ReusableMapViewDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Reusable MapView' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '660c0c6e7c0c4fe5b4cc484c',
		}}>
				<ScreenSwitcher />
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
		padding: 12,
		gap: 8,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	body: { fontSize: 13, color: '#374151' },
	row: { flexDirection: 'row', gap: 8 },
	btn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
	btnOn: { backgroundColor: '#dbeafe' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
});
