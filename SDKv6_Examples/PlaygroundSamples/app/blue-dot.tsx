import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { useBlueDot, useBlueDotEvent } from '@mappedin/blue-dot/rn';
import { MapScreen } from '../components/map-screen';

const COLORS = ['#2266ff', '#22cc44', '#9922cc', '#ff8800'];
const HEADINGS = [0, 90, 180, 270];
const ACCURACIES = [5, 10, 25, 50];

function BlueDotDemo() {
	const { mapView } = useMap();
	const blueDot = useBlueDot();
	const { isReady, enable, disable, reportPosition, updateState } = blueDot;

	const [status, setStatus] = useState('Loading map...');
	const [eventLog, setEventLog] = useState('[--] --');
	const [stateText, setStateText] = useState('State: --');

	// Last reported position, needed when heading/accuracy change independently.
	const last = useRef<{ latitude: number; longitude: number; heading: number; accuracy: number } | null>(null);

	const logEvent = useCallback((message: string) => {
		const stamp = new Date().toLocaleTimeString();
		setEventLog(`[${stamp}] ${message}`);
	}, []);

	useBlueDotEvent('position-update', payload => {
		const floorName = payload.floor?.name ?? 'nil';
		const heading = payload.heading == null ? 'nil' : `${Math.round(payload.heading)}°`;
		logEvent(
			`position-update: (${payload.coordinate.latitude.toFixed(4)}, ${payload.coordinate.longitude.toFixed(4)}) floor=${floorName} heading=${heading}`,
		);
	});
	useBlueDotEvent('status-change', payload => {
		logEvent(`status-change: ${payload.status} (action: ${payload.action})`);
	});
	useBlueDotEvent('follow-change', payload => {
		logEvent(`follow-change: following=${payload.following} mode=${payload.mode ?? 'none'}`);
	});
	useBlueDotEvent('click', payload => {
		logEvent(`click: (${payload.coordinate.latitude.toFixed(4)}, ${payload.coordinate.longitude.toFixed(4)})`);
	});
	useBlueDotEvent('error', payload => {
		logEvent(`error: [${payload.code}] ${payload.message}`);
	});

	const refreshState = useCallback(async () => {
		try {
			// ReactNativeBlueDotState carries the appearance config (color, radius,
			// accuracyRing, heading), not runtime status. Runtime position state comes
			// from the hook's own fields.
			const state = await blueDot.getState();
			setStateText(
				`State: visible=${state.visible} ` +
					`color=${state.color} ` +
					`radius=${state.radius} ` +
					`coord=${last.current ? `${last.current.latitude.toFixed(4)}, ${last.current.longitude.toFixed(4)}` : 'nil'}`,
			);
		} catch {
			setStateText('State: not available');
		}
	}, [blueDot]);

	useMapViewEvent('click', event => {
		const { latitude, longitude } = event.coordinate;
		last.current = {
			latitude,
			longitude,
			heading: last.current?.heading ?? 0,
			accuracy: last.current?.accuracy ?? 5,
		};
		void reportPosition({
			latitude,
			longitude,
			accuracy: last.current.accuracy,
			heading: last.current.heading,
			confidence: 1,
		}).then(() => {
			setStatus('BlueDot placed');
			void refreshState();
		});
	});

	useEffect(() => {
		if (isReady) setStatus('Map loaded - tap Enable to start');
	}, [isReady]);

	const onEnable = useCallback(async () => {
		try {
			await enable({
				accuracyRing: { color: '#2266ff', opacity: 0.25 },
				color: '#2266ff',
				heading: { color: '#2266ff', opacity: 0.6 },
				radius: 12,
				watchDevicePosition: false,
			} as never);
			const center = mapView.Camera.center;
			if (center) {
				last.current = {
					latitude: center[1],
					longitude: center[0],
					heading: last.current?.heading ?? 0,
					accuracy: last.current?.accuracy ?? 5,
				};
				await reportPosition({
					latitude: center[1],
					longitude: center[0],
					accuracy: last.current.accuracy,
					heading: last.current.heading,
					confidence: 1,
				});
				setStatus('BlueDot placed');
			}
		} catch {
			setStatus('Failed to enable BlueDot');
		}
		void refreshState();
	}, [enable, mapView, reportPosition, refreshState]);

	const onDisable = useCallback(async () => {
		await disable();
		setStatus('BlueDot disabled');
		void refreshState();
	}, [disable, refreshState]);

	const onColor = useCallback(
		async (hexColor: string) => {
			await updateState({
				accuracyRing: { color: hexColor, opacity: 0.25 },
				color: hexColor,
				heading: { color: hexColor, opacity: 0.6 },
			} as never);
			setStatus(`BlueDot color changed to ${hexColor}`);
			void refreshState();
		},
		[updateState, refreshState],
	);

	const onHeading = useCallback(
		async (heading: number) => {
			if (!last.current) {
				setStatus('Place a position first');
				return;
			}
			last.current = { ...last.current, heading };
			await reportPosition({ ...last.current, confidence: 1 });
			setStatus(`Heading set to ${heading}°`);
			void refreshState();
		},
		[reportPosition, refreshState],
	);

	const onAccuracy = useCallback(
		async (accuracy: number) => {
			if (!last.current) {
				setStatus('Place a position first');
				return;
			}
			last.current = { ...last.current, accuracy };
			await reportPosition({ ...last.current, confidence: 1 });
			setStatus(`Accuracy set to ${accuracy}m`);
			void refreshState();
		},
		[reportPosition, refreshState],
	);

	return (
		<View style={styles.panel}>
			<ScrollView horizontal={false} contentContainerStyle={styles.scroll}>
				<Text style={styles.status}>{status}</Text>
				<Text style={styles.state}>{stateText}</Text>
				<Text style={styles.events}>{eventLog}</Text>

				<View style={styles.row}>
					<Btn label="Enable" onPress={onEnable} />
					<Btn label="Disable" onPress={onDisable} />
				</View>

				<View style={styles.row}>
					{COLORS.map(c => (
						<Pressable
							key={c}
							style={[styles.swatch, { backgroundColor: c }]}
							onPress={() => onColor(c)}
							accessibilityLabel={c}
						/>
					))}
				</View>

				<View style={styles.row}>
					{HEADINGS.map(h => (
						<Btn key={h} label={`${h}°`} onPress={() => onHeading(h)} />
					))}
				</View>

				<View style={styles.row}>
					{ACCURACIES.map(a => (
						<Btn key={a} label={`${a}m`} onPress={() => onAccuracy(a)} />
					))}
				</View>
			</ScrollView>
		</View>
	);
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
	return (
		<Pressable style={styles.btn} onPress={onPress}>
			<Text style={styles.btnText}>{label}</Text>
		</Pressable>
	);
}

export default function BlueDotScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Blue Dot' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '64ef49e662fd90fe020bee61',
		}}>
				<BlueDotDemo />
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
		maxHeight: '70%',
		backgroundColor: 'rgba(255,255,255,0.94)',
		borderRadius: 10,
		overflow: 'hidden',
	},
	scroll: { padding: 10, gap: 8 },
	status: { fontSize: 13, color: '#4b5563' },
	state: { fontSize: 11, fontFamily: 'Courier', color: '#6b7280' },
	events: { fontSize: 10, fontFamily: 'Courier', color: '#2563eb' },
	row: { flexDirection: 'row', gap: 8 },
	btn: {
		flex: 1,
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingVertical: 8,
		alignItems: 'center',
	},
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
	swatch: { flex: 1, height: 30, borderRadius: 8 },
});
