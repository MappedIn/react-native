import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import type { Facade, Floor, FloorStack } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

interface Option {
	id: string;
	name: string;
}

function Dropdown({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string | null;
	options: Option[];
	onChange: (id: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const selected = options.find(option => option.id === value);

	return (
		<View>
			<Text style={styles.label}>{label}</Text>
			<Pressable style={styles.select} onPress={() => setOpen(current => !current)}>
				<Text style={styles.selectText} numberOfLines={1}>
					{selected?.name ?? 'Select'}
				</Text>
				<Text style={styles.caret}>{open ? '\u25b4' : '\u25be'}</Text>
			</Pressable>
			{open ? (
				<ScrollView style={styles.menu} nestedScrollEnabled>
					{options.map(option => (
						<Pressable
							key={option.id}
							style={[styles.option, option.id === value && styles.optionOn]}
							onPress={() => {
								setOpen(false);
								onChange(option.id);
							}}
						>
							<Text style={styles.optionText}>{option.name}</Text>
						</Pressable>
					))}
				</ScrollView>
			) : null}
		</View>
	);
}

function ManualFocus() {
	const { mapData, mapView } = useMap();
	const stacks = mapData.getByType('floor-stack');
	const facades = mapData.getByType('facade');
	const openFacadeId = useRef<string | null>(null);
	const floorByBuilding = useRef<Record<string, Floor>>({});
	const elevation = useRef(0);
	const [buildingId, setBuildingId] = useState<string | null>(null);
	const [floorId, setFloorId] = useState<string | null>(null);
	const [log, setLog] = useState('Event: --');

	const FADE_MS = 250;
	const floorsOf = (stack: FloorStack) => [...stack.floors].sort((a, b) => b.elevation - a.elevation);

	const showFloors = async (stack: FloorStack) => {
		const inBuilding = floorsOf(stack);
		const closest = inBuilding.reduce<Floor | undefined>(
			(best, floor) =>
				!best || Math.abs(floor.elevation - elevation.current) < Math.abs(best.elevation - elevation.current) ? floor : best,
			undefined,
		);
		const shown = closest ?? stack.defaultFloor;
		if (!shown) return;
		floorByBuilding.current[stack.id] = shown;
		elevation.current = shown.elevation;
		setFloorId(shown.id);
		const height = 10 * shown.elevation;
		for (const floor of inBuilding) {
			await mapView.updateState(
				floor,
				floor.id === shown.id
					? { visible: true, altitude: height, footprint: { visible: shown.elevation > 0, height, altitude: -height } }
					: { visible: false },
			);
		}
	};

	const closeFacade = (facade: Facade) => {
		void mapView.animateState(facade, { opacity: 1 }, { duration: FADE_MS });
		const stack = stacks.find(item => item.id === facade.floorStack.id);
		if (!stack) return;
		setTimeout(() => {
			for (const floor of floorsOf(stack)) void mapView.updateState(floor, { visible: false });
		}, FADE_MS);
	};

	const switchTo = async (stack: FloorStack, focusCamera = true) => {
		setBuildingId(stack.id);
		setLog(`Event: switch ${stack.name}`);
		if (stack.type === 'Outdoor') {
			if (openFacadeId.current) {
				const open = facades.find(item => item.id === openFacadeId.current);
				if (open) closeFacade(open);
			}
			openFacadeId.current = null;
			const outdoor = stack.defaultFloor;
			if (outdoor) {
				await mapView.setFloor(outdoor.id);
				if (focusCamera) await mapView.Camera.focusOn(outdoor);
			}
			setFloorId(outdoor?.id ?? null);
			return;
		}

		const facade = facades.find(item => item.floorStack.id === stack.id);
		if (openFacadeId.current && openFacadeId.current !== facade?.id) {
			const previous = facades.find(item => item.id === openFacadeId.current);
			if (previous) closeFacade(previous);
		}
		if (facade) {
			openFacadeId.current = facade.id;
			await showFloors(stack);
			void mapView.animateState(facade, { opacity: 0 }, { duration: FADE_MS });
		} else {
			openFacadeId.current = null;
			await showFloors(stack);
		}
		const shown = floorByBuilding.current[stack.id];
		if (shown && focusCamera) await mapView.Camera.focusOn(shown);
	};

	useEffect(() => {
		const showLoaded = () => {
			const current = mapView.currentFloor as { id?: string } | undefined;
			if (!current?.id) return false;
			const floor = mapData.getById('floor', current.id);
			const stack = floor?.floorStack ?? stacks.find(item => item.floors.some(candidate => candidate.id === current.id));
			if (!stack) return false;
			setBuildingId(stack.id);
			setFloorId(current.id);
			elevation.current = floor?.elevation ?? 0;
			return true;
		};
		if (showLoaded()) return;
		const timer = setInterval(() => {
			if (showLoaded()) clearInterval(timer);
		}, 300);
		const stop = setTimeout(() => clearInterval(timer), 5000);
		return () => {
			clearInterval(timer);
			clearTimeout(stop);
		};
	}, [mapData, mapView, stacks]);

	useMapViewEvent('facades-in-view-change', event => {
		const facade = event.facades?.[0];
		if (!facade) return;
		setLog(`Event: facades-in-view-change (${event.facades.length})`);
		const stack = stacks.find(item => item.id === facade.floorStack.id);
		if (stack && stack.id !== buildingId) void switchTo(stack, false);
	});

	const selected = stacks.find(stack => stack.id === buildingId);
	const floorChoices = selected && selected.type !== 'Outdoor' ? floorsOf(selected) : [];

	return (
		<View style={styles.card}>
			<Text style={styles.log}>{log}</Text>
			<Dropdown
				label="Building"
				value={buildingId}
				options={stacks.map(stack => ({ id: stack.id, name: stack.name }))}
				onChange={id => {
					const stack = stacks.find(item => item.id === id);
					if (stack) void switchTo(stack);
				}}
			/>
			<Dropdown
				label="Floor"
				value={floorId}
				options={floorChoices.map(floor => ({ id: floor.id, name: floor.name }))}
				onChange={id => {
					if (!selected) return;
					const floor = floorChoices.find(item => item.id === id);
					if (!floor) return;
					floorByBuilding.current[selected.id] = floor;
					elevation.current = floor.elevation;
					void showFloors(selected);
				}}
			/>
		</View>
	);
}

export default function DynamicFocusManualDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Dynamic Focus (Manual)' }} />
			<MapScreen
				mapData={{
					// See Demo API Key Terms and Conditions
					// https://developer.mappedin.com/docs/demo-keys-and-maps
					key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
					secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
					mapId: '682e13a2703478000b567b66',
				}}
				options={{ outdoorView: { enabled: true } }}
			>
				<ManualFocus />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 240,
		borderRadius: 10,
		padding: 10,
		gap: 8,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	log: { fontSize: 12, color: '#2266ff' },
	label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
	select: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	selectText: { flex: 1, fontSize: 14, color: '#111827' },
	caret: { fontSize: 12, color: '#6b7280', marginLeft: 8 },
	menu: { maxHeight: 160, marginTop: 4, borderRadius: 8, backgroundColor: '#fff' },
	option: { paddingHorizontal: 10, paddingVertical: 8 },
	optionOn: { backgroundColor: '#dbeafe' },
	optionText: { fontSize: 14, color: '#111827' },
});
