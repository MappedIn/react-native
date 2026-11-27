import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDynamicFocus } from '@mappedin/dynamic-focus/rn';
import { MapScreen } from '../components/map-screen';

function FocusControls() {
	const { isReady, enable, disable } = useDynamicFocus();
	const [status, setStatus] = useState('Map loaded - tap Enable to start Dynamic Focus');

	return (
		<View style={styles.panel}>
			<Text style={styles.body}>{status}</Text>
			<View style={styles.row}>
				<Pressable
					style={styles.btn}
					disabled={!isReady}
					onPress={() => {
						void enable({ autoFocus: true, setFloorOnFocus: true } as never).then(
							() => setStatus('Dynamic Focus enabled - zoom and pan to see auto focus'),
							() => setStatus('Error enabling Dynamic Focus'),
						);
					}}
				>
					<Text style={styles.btnText}>Enable</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						void disable().then(() => setStatus('Dynamic Focus disabled'));
					}}
				>
					<Text style={styles.btnText}>Disable</Text>
				</Pressable>
			</View>
		</View>
	);
}

export default function DynamicFocusDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Dynamic Focus' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '682e13a2703478000b567b66',
		}}>
				<FocusControls />
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
		backgroundColor: 'rgba(255,255,255,0.94)',
		borderRadius: 10,
		padding: 12,
		gap: 8,
	},
	body: { fontSize: 13, color: '#374151' },
	row: { flexDirection: 'row', gap: 8 },
	btn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
	btnText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
});
