import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
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
				<Text style={styles.caret}>{open ? '▴' : '▾'}</Text>
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

function FloorPicker() {
	const { mapData, mapView } = useMap();
	const [stacks, setStacks] = useState<Option[]>([]);
	const [floors, setFloors] = useState<Option[]>([]);
	const [stackId, setStackId] = useState<string | null>(null);
	const [floorId, setFloorId] = useState<string | null>(null);

	const floorsFor = (id: string) => {
		const stack = mapData.getById('floor-stack', id);
		return [...(stack?.floors ?? [])]
			.sort((a, b) => b.elevation - a.elevation)
			.map(floor => ({ id: floor.id, name: floor.name }));
	};

	const selectStack = (id: string) => {
		setStackId(id);
		const next = floorsFor(id);
		setFloors(next);
		void mapView.setFloorStack(id).then(async () => {
			const current = mapView.currentFloor as { id?: string } | undefined;
			const currentFloor = current?.id ? mapData.getById('floor', current.id) : undefined;
			const selected = currentFloor && next.some(item => item.id === currentFloor.id) ? currentFloor : mapData.getById('floor', next[0]?.id ?? '');
			setFloorId(selected?.id ?? null);
			if (selected && selected.id !== current?.id) await mapView.setFloor(selected.id);
			if (selected) void mapView.Camera.focusOn(selected);
		});
	};

	useEffect(() => {
		const next = mapData
			.getByType('floor-stack')
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name))
			.map(stack => ({ id: stack.id, name: stack.name }));
		setStacks(next);

		const showLoaded = () => {
			const current = mapView.currentFloor as { id?: string } | undefined;
			if (!current?.id) return false;
			const floor = mapData.getById('floor', current.id);
			const loadedStack = floor?.floorStack ?? next.find(stack => mapData.getById('floor-stack', stack.id)?.floors.some(item => item.id === current.id));
			if (!loadedStack) return false;
			const stack = 'floors' in loadedStack ? loadedStack : mapData.getById('floor-stack', loadedStack.id);
			if (!stack) return false;
			setStackId(stack.id);
			setFloors(floorsFor(stack.id));
			setFloorId(current.id);
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
	}, [mapData, mapView]);

	return (
		<View style={styles.panel}>
			<Dropdown label="Building" value={stackId} options={stacks} onChange={selectStack} />
			<Dropdown
				label="Floor"
				value={floorId}
				options={floors}
				onChange={id => {
					setFloorId(id);
					const floor = mapData.getById('floor', id);
					void mapView.setFloor(id).then(() => {
						if (floor) void mapView.Camera.focusOn(floor);
					});
				}}
			/>
		</View>
	);
}

export default function BuildingFloorSelectionDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Building & Floor Selection' }} />
			<MapScreen
				mapData={{
					// See Demo API Key Terms and Conditions
					// https://developer.mappedin.com/docs/demo-keys-and-maps
					key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
					secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
					mapId: '682e13a2703478000b567b66',
				}}
			>
				<FloorPicker />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	panel: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 240,
		borderRadius: 10,
		padding: 10,
		gap: 8,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
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
