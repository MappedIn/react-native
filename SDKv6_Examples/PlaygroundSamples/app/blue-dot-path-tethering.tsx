import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { useBlueDot, useBlueDotEvent } from '@mappedin/blue-dot/rn';
import type { Directions } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';
import singleWalk from '../assets/tethering-demo-mall.json';
import multiWalk from '../assets/tethering-demo-mall-multi-dest.json';

const START = 's_6650b9a8cad393835892b92b';
const MUCHO = 's_62042759e325474a3000007b';
const REEBOK = 's_62042759e325474a30000079';
const ARITZIA = 's_62051551e325474a300010d5';
const PLAYBACK_MS = 1500;
const DESTINATIONS = ['Mucho Burrito', 'Reebok', 'Aritzia'];
const OUTSIDE_MODES = ['tether-and-dash', 'tether-only', 'untether'] as const;
const OUTSIDE_STYLES = ['dashed-boxes', 'dashed-stripes', 'dashed-sparse', 'solid', 'bordered'] as const;

type WalkPoint = {
	latitude: number;
	longitude: number;
	accuracy?: number;
	heading?: number;
	floorOrFloorId?: string | null;
};

type Mode = 'none' | 'single' | 'multi';
type Tracking = 'tethered' | 'travelled';

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
	return (
		<Pressable style={[styles.chip, selected && styles.chipOn]} onPress={onPress}>
			<Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
		</Pressable>
	);
}

function Tethering() {
	const { mapData, mapView } = useMap();
	const { isReady, enable, follow, reportPosition, disable } = useBlueDot();
	const single = useRef<Directions | null>(null);
	const multi = useRef<Directions[] | null>(null);
	const floors = useRef<Record<string, number>>({});
	const lastPosition = useRef<WalkPoint | null>(null);
	const index = useRef(0);
	const drawn = useRef(false);
	const activeLeg = useRef(0);

	const [mode, setMode] = useState<Mode>('none');
	const [tracking, setTracking] = useState<Tracking>('tethered');
	const [enabled, setEnabled] = useState(true);
	const [threshold, setThreshold] = useState(5);
	const [hideMarkers, setHideMarkers] = useState(false);
	const [outsideMode, setOutsideMode] = useState<(typeof OUTSIDE_MODES)[number]>('tether-and-dash');
	const [outsideStyle, setOutsideStyle] = useState<(typeof OUTSIDE_STYLES)[number]>('dashed-boxes');
	const [travelledColor, setTravelledColor] = useState('#999999');
	const [destination, setDestination] = useState(0);
	const [paused, setPaused] = useState(false);
	const [speed, setSpeed] = useState(1);
	const [step, setStep] = useState(0);
	const [expanded, setExpanded] = useState(true);
	const [status, setStatus] = useState({ tracking: '—', outside: '—', current: '—', fraction: '—' });
	const [notice, setNotice] = useState('Choose a path');

	const walk = (mode === 'multi' ? multiWalk : singleWalk) as WalkPoint[];

	useEffect(() => {
		for (const floor of mapData.getByType('floor')) floors.current[floor.id] = floor.elevation;
		const level2 = mapData.getByType('floor').find(floor => floor.name === 'Level 2');
		if (level2) void mapView.setFloor(level2.id);
		const start = mapData.getById('space', START);
		const aritzia = mapData.getById('space', ARITZIA);
		const mucho = mapData.getById('space', MUCHO);
		const reebok = mapData.getById('space', REEBOK);
		if (start && aritzia) {
			void mapView.getDirections(start, aritzia).then(route => {
				single.current = route ?? null;
			});
		}
		if (start && mucho && reebok && aritzia) {
			void mapView.getDirectionsMultiDestination(start, [mucho, reebok, aritzia]).then(routes => {
				multi.current = routes ?? null;
			});
		}
	}, [mapData, mapView]);

	const settings = useRef({ tracking, threshold, hideMarkers, outsideMode, outsideStyle, travelledColor, enabled, mode });
	settings.current = { tracking, threshold, hideMarkers, outsideMode, outsideStyle, travelledColor, enabled, mode };

	const call = (name: string, ...args: unknown[]) =>
		(mapView.Navigation as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[name](...args);

	const refresh = async () => {
		const [isTracking, outside, current, fraction] = await Promise.all([
			call('isTracking'),
			call('isShowingOutsideThresholdPath'),
			call('currentTrackingMode'),
			call('travelledFraction'),
		]);
		setStatus({
			tracking: String(isTracking ?? false),
			outside: String(outside ?? false),
			current: current == null ? 'null' : String(current),
			fraction: fraction == null ? 'null' : `${(Number(fraction) * 100).toFixed(1)}%`,
		});
	};

	const legFor = (position: WalkPoint) => {
		const routes = multi.current;
		if (!routes?.length) return 0;
		let best = 0;
		let bestDistance = Number.POSITIVE_INFINITY;
		routes.forEach((route, leg) => {
			for (const coordinate of route.coordinates) {
				const distance =
					(coordinate.latitude - position.latitude) ** 2 + (coordinate.longitude - position.longitude) ** 2;
				if (distance < bestDistance) {
					bestDistance = distance;
					best = leg;
				}
			}
		});
		return best;
	};

	const track = async (position = lastPosition.current) => {
		const current = settings.current;
		if (!drawn.current || !position || current.mode === 'none' || !current.enabled) return;
		if (current.mode === 'multi') {
			const leg = legFor(position);
			if (leg !== activeLeg.current) {
				activeLeg.current = leg;
				setDestination(leg);
				await call('setActivePathByIndex', leg);
			}
		}
		const next =
			current.tracking === 'tethered'
				? {
						mode: 'tethered' as const,
						tetherThresholdDistance: current.threshold,
						hideMarkersOutsideThreshold: current.hideMarkers,
						coordinateOutsideThresholdMode: current.outsideMode,
						outsideThresholdPathStyle: current.outsideStyle,
					}
				: { mode: 'travelled' as const, color: current.travelledColor };
		await call('trackCoordinate', {
			__type: 'coordinate',
			latitude: position.latitude,
			longitude: position.longitude,
			floorId: position.floorOrFloorId ?? undefined,
		}, next);
		await refresh();
	};

	const place = (point: WalkPoint) => {
		const floorLevel = point.floorOrFloorId ? floors.current[point.floorOrFloorId] : undefined;
		lastPosition.current = point;
		void reportPosition({
			latitude: point.latitude,
			longitude: point.longitude,
			accuracy: point.accuracy,
			heading: point.heading,
			floorLevel,
			confidence: 1,
		}).then(() => track(point));
	};

	useBlueDotEvent('dot-position-update', () => {
		void track();
	});

	useMapViewEvent('click', event => {
		place({
			latitude: event.coordinate.latitude,
			longitude: event.coordinate.longitude,
			accuracy: 5,
			heading: 0,
			floorOrFloorId: event.floors?.[0]?.id,
		});
	});

	useEffect(() => {
		if (mode === 'none') return;
		const timer = setInterval(() => {
			if (paused) return;
			const points = walk;
			if (index.current >= points.length) index.current = 0;
			place(points[index.current]);
			setStep(index.current);
			index.current += 1;
		}, PLAYBACK_MS / speed);
		return () => clearInterval(timer);
	}, [mode, paused, speed, walk]);

	const draw = async (next: Exclude<Mode, 'none'>) => {
		const route = next === 'single' ? single.current : multi.current;
		if (!route) {
			setNotice('Directions still loading — try again in a moment');
			return;
		}
		if (isReady) {
			await enable({ radius: 5, watchDevicePosition: false } as never);
			await follow('position-and-path-direction', { zoomLevel: 19.058859291133 });
		}
		drawn.current = false;
		setMode(next);
		setEnabled(true);
		activeLeg.current = 0;
		setDestination(0);
		index.current = 0;
		setStep(0);
		setPaused(false);
		setExpanded(false);
		await mapView.Navigation.clear();
		await mapView.Navigation.draw(route, {
			pathOptions: { color: '#4b90e2', accentColor: 'white', displayArrowsOnPath: false, animateArrowsOnPath: false },
			inactivePathOptions: { color: '#93c5fd', displayArrowsOnPath: false },
		});
		if (next === 'multi') await call('setActivePathByIndex', 0);
		drawn.current = true;
		setNotice(next === 'single' ? 'Single path' : 'Multi-destination path');
		void refresh();
	};

	const clear = async () => {
		drawn.current = false;
		setMode('none');
		index.current = 0;
		lastPosition.current = null;
		await call('stopTracking');
		await mapView.Navigation.clear();
		await disable();
		setStatus({ tracking: '—', outside: '—', current: '—', fraction: '—' });
		setExpanded(true);
		setNotice('Choose a path');
	};

	const playback = mode !== 'none' ? (
		<View style={styles.scrubber}>
			<Pressable onPress={() => setPaused(value => !value)}>
				<Text style={styles.scrubberText}>{paused ? '▶' : '❚❚'}</Text>
			</Pressable>
			<Pressable onPress={() => setSpeed(value => (value === 1 ? 2 : 1))}>
				<Text style={styles.scrubberText}>{speed}x</Text>
			</Pressable>
			<Text style={styles.scrubberText}>
				{step}/{walk.length - 1}
			</Text>
			<Pressable
				onPress={() => {
					const next = Math.max(0, step - 1);
					index.current = next;
					setStep(next);
					place(walk[next]);
				}}
			>
				<Text style={styles.scrubberText}>−</Text>
			</Pressable>
			<Pressable
				onPress={() => {
					const next = Math.min(walk.length - 1, step + 1);
					index.current = next;
					setStep(next);
					place(walk[next]);
				}}
			>
				<Text style={styles.scrubberText}>+</Text>
			</Pressable>
			<Pressable onPress={() => setExpanded(value => !value)}>
				<Text style={styles.scrubberText}>{expanded ? '▴' : '▾'}</Text>
			</Pressable>
		</View>
	) : null;

	if (mode !== 'none' && !expanded) {
		return (
			<View style={styles.compact} pointerEvents="box-none">
				<Text style={styles.compactTitle} numberOfLines={1}>
					{notice}
				</Text>
				{playback}
			</View>
		);
	}

	return (
		<View style={styles.card} pointerEvents="box-none">
			<ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
				<View style={styles.titleRow}>
					<Text style={styles.notice}>{notice}</Text>
					{mode !== 'none' ? (
						<Pressable onPress={() => setExpanded(false)}>
							<Text style={styles.shrink}>▴</Text>
						</Pressable>
					) : null}
				</View>
				<View style={styles.statusGrid}>
					<Text style={styles.row}>tracking {status.tracking}</Text>
					<Text style={styles.row}>outside {status.outside}</Text>
					<Text style={styles.row}>mode {status.current}</Text>
					<Text style={styles.row}>travelled {status.fraction}</Text>
				</View>

				{mode === 'none' ? (
					<>
						<Text style={styles.label}>Tracking Mode</Text>
						<View style={styles.chips}>
							<Chip label="Tethered" selected={tracking === 'tethered'} onPress={() => setTracking('tethered')} />
							<Chip label="Travelled" selected={tracking === 'travelled'} onPress={() => setTracking('travelled')} />
						</View>
						<View style={styles.chips}>
							<Chip label="Single Path" selected={false} onPress={() => void draw('single')} />
							<Chip label="Multi-Destination" selected={false} onPress={() => void draw('multi')} />
						</View>
					</>
				) : (
					<>
						<View style={styles.switchRow}>
							<Text style={styles.label}>Tracking Enabled</Text>
							<Switch
								value={enabled}
								onValueChange={value => {
									settings.current.enabled = value;
									setEnabled(value);
									if (!value) void call('stopTracking').then(refresh);
									else track();
								}}
							/>
						</View>
						{tracking === 'tethered' ? (
							<>
								<Text style={styles.label}>Tether Threshold: {threshold} m</Text>
								<View style={styles.chips}>
									<Chip label="−" selected={false} onPress={() => { const next = Math.max(1, threshold - 1); settings.current.threshold = next; setThreshold(next); track(); }} />
									<Chip label="+" selected={false} onPress={() => { const next = Math.min(20, threshold + 1); settings.current.threshold = next; setThreshold(next); track(); }} />
								</View>
								<View style={styles.switchRow}>
									<Text style={styles.label}>Hide Markers Outside Threshold</Text>
									<Switch value={hideMarkers} onValueChange={value => { settings.current.hideMarkers = value; setHideMarkers(value); track(); }} />
								</View>
								<Text style={styles.label}>Outside Threshold Mode</Text>
								<View style={styles.chips}>
									{OUTSIDE_MODES.map(item => (
										<Chip key={item} label={item} selected={outsideMode === item} onPress={() => { settings.current.outsideMode = item; setOutsideMode(item); track(); }} />
									))}
								</View>
								<Text style={styles.label}>Outside Threshold Style</Text>
								<View style={styles.chips}>
									{OUTSIDE_STYLES.map(item => (
										<Chip key={item} label={item} selected={outsideStyle === item} onPress={() => { settings.current.outsideStyle = item; setOutsideStyle(item); track(); }} />
									))}
								</View>
							</>
						) : (
							<>
								<Text style={styles.label}>Travelled Color (hex)</Text>
								<TextInput
									style={styles.input}
									value={travelledColor}
									autoCapitalize="none"
									onChangeText={value => {
										settings.current.travelledColor = value;
										setTravelledColor(value);
										if (/^#[0-9a-fA-F]{6}$/.test(value)) track();
									}}
								/>
							</>
						)}
						{mode === 'multi' ? (
							<>
								<Text style={styles.label}>Active Destination</Text>
								<View style={styles.chips}>
									{DESTINATIONS.map((name, item) => (
										<Chip
											key={name}
											label={name}
											selected={destination === item}
											onPress={() => {
												activeLeg.current = item;
												setDestination(item);
												void call('setActivePathByIndex', item).then(() => track());
											}}
										/>
									))}
								</View>
							</>
						) : null}
						<Chip label="Clear Navigation" selected={false} onPress={() => void clear()} />
					</>
				)}
				{playback}
			</ScrollView>
		</View>
	);
}

export default function BlueDotPathTetheringDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Blue Dot Path Tethering' }} />
			<MapScreen
				mapData={{
					// See Demo API Key Terms and Conditions
					// https://developer.mappedin.com/docs/demo-keys-and-maps
					key: '5eab30aa91b055001a68e996',
					secret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
					mapId: 'mappedin-demo-mall',
				}}
			>
				<Tethering />
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
		maxWidth: '92%',
		maxHeight: '55%',
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	compact: {
		position: 'absolute',
		top: 8,
		left: 8,
		right: 8,
		maxWidth: 360,
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	compactTitle: { fontSize: 12, fontWeight: '600', color: '#111827', paddingHorizontal: 10, paddingTop: 8 },
	titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	shrink: { fontSize: 16, color: '#374151', paddingHorizontal: 6 },
	panel: { flexGrow: 0 },
	panelContent: { padding: 8, gap: 6 },
	statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
	row: { width: '48%', fontSize: 10, fontFamily: 'Courier', color: '#111827' },
	notice: { fontSize: 12, fontWeight: '600', color: '#111827' },
	label: { fontSize: 11, color: '#6b7280' },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	chip: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
	chipOn: { backgroundColor: '#1f2937' },
	chipText: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
	chipTextOn: { color: '#fff' },
	switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13 },
	scrubber: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'rgba(0,0,0,0.85)',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	scrubberText: { color: '#fff', fontSize: 14, fontWeight: '700', minWidth: 28, textAlign: 'center' },
});
