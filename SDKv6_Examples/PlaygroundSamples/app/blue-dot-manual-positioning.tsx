import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import { useBlueDot } from '@mappedin/blue-dot/rn';
import { MapScreen } from '../components/map-screen';

function ManualControls() {
	const { mapView } = useMap();
	const { isReady, enable, forcePosition, reportPosition, enableSensor, disableSensor } = useBlueDot();
	const [status, setStatus] = useState('Tap Enable, then Force or Report.');
	const [sensorOn, setSensorOn] = useState(false);

	const center = () => {
		const value = mapView.Camera.center;
		if (!Array.isArray(value)) return null;
		return { latitude: value[1], longitude: value[0] };
	};

	return (
		<View style={styles.panel}>
			<Text style={styles.body}>{status}</Text>
			<View style={styles.row}>
				<Pressable
					style={styles.btn}
					disabled={!isReady}
					onPress={() => {
						void enable({ watchDevicePosition: false, color: '#2266ff' } as never).then(
							() => setStatus('BlueDot enabled'),
							() => setStatus('Failed to enable BlueDot'),
						);
					}}
				>
					<Text style={styles.btnText}>Enable</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						const point = center();
						if (!point) {
							setStatus('Camera center is not ready');
							return;
						}
						void forcePosition({ ...point, heading: 90 }, 30_000).then(
							() => setStatus('Position forced for 30s'),
							error => setStatus(`forcePosition error: ${error}`),
						);
					}}
				>
					<Text style={styles.btnText}>Force Position</Text>
				</Pressable>
			</View>
			<View style={styles.row}>
				<Pressable
					style={styles.btn}
					onPress={() => {
						void (sensorOn ? disableSensor('manual') : enableSensor('manual')).then(
							() => {
								setSensorOn(!sensorOn);
								setStatus(sensorOn ? 'Manual sensor disabled' : 'Manual sensor enabled');
							},
							() => setStatus('Sensor toggle failed'),
						);
					}}
				>
					<Text style={styles.btnText}>{sensorOn ? 'Disable Manual Sensor' : 'Enable Manual Sensor'}</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						const point = center();
						if (!point) return;
						void reportPosition({ ...point, confidence: 0.8 }).then(
							() => setStatus('Position reported (confidence: 0.8)'),
							() => setStatus('reportPosition failed — enable the manual sensor first'),
						);
					}}
				>
					<Text style={styles.btnText}>Report Position</Text>
				</Pressable>
			</View>
		</View>
	);
}

export default function BlueDotManualPositioningDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Blue Dot Manual Positioning' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '64ef49e662fd90fe020bee61',
		}}>
				<ManualControls />
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
		backgroundColor: 'rgba(255,255,255,0.94)',
		borderRadius: 10,
		padding: 12,
		gap: 8,
	},
	body: { fontSize: 13, color: '#374151' },
	row: { flexDirection: 'row', gap: 8 },
	btn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
});
