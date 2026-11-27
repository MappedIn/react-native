import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Coordinate, useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

interface CameraDefaults {
	pitch: number;
	zoomLevel: number;
	bearing: number;
	center: { latitude: number; longitude: number };
}

const PITCH_STEP = 15;
const ZOOM_STEP = 1;

function CameraControls() {
	const { mapView } = useMap();
	const defaults = useRef<CameraDefaults | null>(null);
	const [hint, setHint] = useState('Interactive camera controls. Click the map to focus.');

	const captureDefaults = useCallback(() => {
		// Camera.pitch/zoomLevel/bearing/center are cached property values on the RN
		// bridge, not callable getters. They populate once the map posts initial state,
		// so this is retried rather than read once.
		const pitch = mapView.Camera.pitch;
		const zoomLevel = mapView.Camera.zoomLevel;
		const bearing = mapView.Camera.bearing;
		const center = mapView.Camera.center;

		if (typeof pitch !== 'number' || !Array.isArray(center)) return false;

		defaults.current = { pitch, zoomLevel, bearing, center: { latitude: center[1], longitude: center[0] } };
		return true;
	}, [mapView]);

	useEffect(() => {
		if (captureDefaults()) return;

		const timer = setInterval(() => {
			if (captureDefaults()) clearInterval(timer);
		}, 500);
		const stop = setTimeout(() => clearInterval(timer), 10000);

		return () => {
			clearInterval(timer);
			clearTimeout(stop);
		};
	}, [captureDefaults]);

	useMapViewEvent('click', event => {
		void mapView.Camera.focusOn(event.coordinate);
	});

	useMapViewEvent('camera-change', transform => {
		if (!transform) return;
		console.log(
			`Camera changed to bearing: ${transform.bearing}, pitch: ${transform.pitch}, ` +
				`zoomLevel: ${transform.zoomLevel}, center: Lat: ${transform.center.latitude}, ` +
				`Lon: ${transform.center.longitude}`,
		);
	});

	const increasePitch = useCallback(async () => {
		const current = mapView.Camera.pitch ?? 0;
		await mapView.Camera.set({ pitch: current + PITCH_STEP });
		setHint(`Pitch increased by ${PITCH_STEP}`);
	}, [mapView]);

	const decreasePitch = useCallback(async () => {
		const current = mapView.Camera.pitch ?? 0;
		await mapView.Camera.set({ pitch: current - PITCH_STEP });
		setHint(`Pitch decreased by ${PITCH_STEP}`);
	}, [mapView]);

	const zoomIn = useCallback(async () => {
		const current = mapView.Camera.zoomLevel ?? 0;
		await mapView.Camera.set({ zoomLevel: current + ZOOM_STEP });
		setHint('Zoomed in');
	}, [mapView]);

	const zoomOut = useCallback(async () => {
		const current = mapView.Camera.zoomLevel ?? 0;
		await mapView.Camera.set({ zoomLevel: current - ZOOM_STEP });
		setHint('Zoomed out');
	}, [mapView]);

	const animate = useCallback(async () => {
		// `Camera.center` arrives from the bridge as a plain object, but `animateTo`
		// needs a real Coordinate instance on the web side. Rebuild one from the
		// cached values so the bridge receives valid numbers.
		const d = defaults.current;
		if (!d) {
			setHint('Camera defaults not ready yet');
			return;
		}
		await mapView.Camera.animateTo(
			{
				bearing: 180,
				center: new Coordinate({ latitude: d.center.latitude, longitude: d.center.longitude }),
				pitch: 60,
				zoomLevel: 21,
			},
			{ duration: 3000, easing: 'ease-in-out' },
		);
		setHint('Camera animated');
	}, [mapView]);

	const reset = useCallback(async () => {
		const d = defaults.current;
		if (!d) return;
		// Same as animateTo: the centre must be a coordinate the web side can read.
		await mapView.Camera.set({
			bearing: d.bearing,
			pitch: d.pitch,
			zoomLevel: d.zoomLevel,
			center: new Coordinate({ latitude: d.center.latitude, longitude: d.center.longitude }),
		});
		setHint('Camera reset to default');
	}, [mapView]);

	return (
		<View style={styles.controls}>
			<Text style={styles.hint}>{hint}</Text>
			<Row>
				<Btn label="Increase Pitch" onPress={increasePitch} />
				<Btn label="Decrease Pitch" onPress={decreasePitch} />
			</Row>
			<Row>
				<Btn label="Zoom In" onPress={zoomIn} />
				<Btn label="Zoom Out" onPress={zoomOut} />
			</Row>
			<Row>
				<Btn label="Animate" onPress={animate} />
				<Btn label="Reset" onPress={reset} />
			</Row>
		</View>
	);
}

function Row({ children }: { children: React.ReactNode }) {
	return <View style={styles.row}>{children}</View>;
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
	return (
		<Pressable style={styles.btn} onPress={onPress}>
			<Text style={styles.btnText}>{label}</Text>
		</Pressable>
	);
}

export default function CameraDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Camera' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '67881b4666a208000badecc4',
		}}>
				<CameraControls />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	controls: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 280,
		gap: 8,
	},
	hint: {
		fontSize: 12,
		color: '#111827',
		backgroundColor: 'rgba(255,255,255,0.92)',
		borderRadius: 8,
		paddingVertical: 6,
		paddingHorizontal: 10,
	},
	row: { flexDirection: 'row', gap: 8 },
	btn: {
		flex: 1,
		backgroundColor: 'rgba(255,255,255,0.95)',
		borderRadius: 8,
		paddingVertical: 10,
		alignItems: 'center',
	},
	btnText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
});
