import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

function StackedControls() {
	const { mapData, mapView } = useMap();
	const [gap, setGap] = useState(25);
	const [animate, setAnimate] = useState(true);

	const floors = () => mapData.getByType('floor');

	const expand = async (distance: number, animated: boolean) => {
		await mapView.Camera.setPanMode('elevation');
		await mapView.Outdoor.hide();
		const all = floors();
		if (!animated) {
			await Promise.all(
				all.map(floor =>
					mapView.updateState(floor, {
						altitude: floor.elevation * distance,
						visible: true,
						geometry: { visible: true, opacity: 1 },
					}),
				),
			);
			return;
		}
		await Promise.all(all.map(floor => mapView.updateState(floor, { visible: true, geometry: { visible: true } })));
		await Promise.all(
			all.map(floor =>
				mapView.animateState(floor, { altitude: floor.elevation * distance, geometry: { opacity: 1 } }, { duration: 600 }),
			),
		);
	};

	const collapse = async (animated: boolean) => {
		await mapView.Camera.setPanMode('default');
		const all = floors();
		const currentId = (mapView.currentFloor as { id?: string } | undefined)?.id ?? all.find(floor => floor.elevation === 0)?.id;
		if (!animated) {
			await Promise.all(
				all.map(floor => {
					const current = floor.id === currentId;
					return mapView.updateState(floor, {
						altitude: 0,
						visible: current,
						geometry: { visible: current, opacity: current ? 1 : 0 },
					});
				}),
			);
			return;
		}
		await Promise.all(
			all.map(floor =>
				mapView.animateState(
					floor,
					{ altitude: 0, geometry: { opacity: floor.id === currentId ? 1 : 0 } },
					{ duration: 600 },
				),
			),
		);
		await Promise.all(
			all
				.filter(floor => floor.id !== currentId)
				.map(floor => mapView.updateState(floor, { visible: false, altitude: 0, geometry: { visible: false, opacity: 0 } })),
		);
	};

	useEffect(() => {
		void mapView.Camera.setMaxPitch(88);
		void mapView.Camera.set({ pitch: 75 });
		void expand(25, true);
		// Expand once the map is ready.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapData, mapView]);

	return (
		<View style={styles.panel}>
			<Pressable style={styles.btn} onPress={() => void expand(gap, animate)}>
				<Text style={styles.btnText}>Expand</Text>
			</Pressable>
			<Pressable style={styles.btn} onPress={() => void collapse(animate)}>
				<Text style={styles.btnText}>Collapse</Text>
			</Pressable>
			<View style={styles.switchRow}>
				<Text style={styles.label}>Animate</Text>
				<Switch value={animate} onValueChange={setAnimate} />
			</View>
			<Text style={styles.label}>Floor Gap: {gap}m</Text>
			<View style={styles.row}>
				<Pressable
					style={styles.btn}
					onPress={() => {
						const next = Math.max(0, gap - 5);
						setGap(next);
						void expand(next, animate);
					}}
				>
					<Text style={styles.btnText}>−</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						const next = Math.min(50, gap + 5);
						setGap(next);
						void expand(next, animate);
					}}
				>
					<Text style={styles.btnText}>+</Text>
				</Pressable>
			</View>
		</View>
	);
}

export default function StackedMapsDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Stacked Maps' }} />
			<MapScreen
				mapData={{
					// See Demo API Key Terms and Conditions
					// https://developer.mappedin.com/docs/demo-keys-and-maps
					key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
					secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
					mapId: '666ca6a48dd908000bf47803',
				}}
				options={{ pitch: 80 }}
			>
				<StackedControls />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	panel: {
		position: 'absolute',
		top: 12,
		left: 12,
		width: 180,
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 12,
		gap: 8,
	},
	row: { flexDirection: 'row', gap: 8 },
	switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	label: { fontSize: 13, color: '#374151' },
	btn: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
	btnText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
});
