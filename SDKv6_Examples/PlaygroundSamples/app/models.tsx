import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import positions from '../assets/model_positions.json';
import { MapScreen } from '../components/map-screen';

const MODELS: Record<string, string> = {
	airplane: require('@mappedin/3d-assets/inline/airplane.js').default,
	bookshelf: require('@mappedin/3d-assets/inline/bookshelf.js').default,
	box_cardboard: require('@mappedin/3d-assets/inline/box_cardboard.js').default,
	can_garbage: require('@mappedin/3d-assets/inline/can_garbage.js').default,
	can_recycling: require('@mappedin/3d-assets/inline/can_recycling.js').default,
	car: require('@mappedin/3d-assets/inline/car.js').default,
	chair: require('@mappedin/3d-assets/inline/chair.js').default,
	couch: require('@mappedin/3d-assets/inline/couch.js').default,
	couch_outward_curve: require('@mappedin/3d-assets/inline/couch_outward_curve.js').default,
	curved_couch: require('@mappedin/3d-assets/inline/curved_couch.js').default,
	desk_chair: require('@mappedin/3d-assets/inline/desk_chair.js').default,
	desk_scalable: require('@mappedin/3d-assets/inline/desk_scalable.js').default,
	e_vehicle_charger: require('@mappedin/3d-assets/inline/e_vehicle_charger.js').default,
	flagpole_ca: require('@mappedin/3d-assets/inline/flagpole_ca.js').default,
	floor_lamp: require('@mappedin/3d-assets/inline/floor_lamp.js').default,
	fountain: require('@mappedin/3d-assets/inline/fountain.js').default,
	kitchen_sink: require('@mappedin/3d-assets/inline/kitchen_sink.js').default,
	plant_1: require('@mappedin/3d-assets/inline/plant_1.js').default,
	plant_2: require('@mappedin/3d-assets/inline/plant_2.js').default,
	privacy_booth: require('@mappedin/3d-assets/inline/privacy_booth.js').default,
	refrigerator: require('@mappedin/3d-assets/inline/refrigerator.js').default,
	round_table: require('@mappedin/3d-assets/inline/round_table.js').default,
	shipping_container: require('@mappedin/3d-assets/inline/shipping_container.js').default,
	shopping_shelves: require('@mappedin/3d-assets/inline/shopping_shelves.js').default,
	street_lamp: require('@mappedin/3d-assets/inline/street_lamp.js').default,
	street_lamp_double: require('@mappedin/3d-assets/inline/street_lamp_double.js').default,
	street_lamp_single: require('@mappedin/3d-assets/inline/street_lamp_single.js').default,
	toilet: require('@mappedin/3d-assets/inline/toilet.js').default,
	tree_deciduous: require('@mappedin/3d-assets/inline/tree_deciduous.js').default,
	tree_deciduous_2: require('@mappedin/3d-assets/inline/tree_deciduous_2.js').default,
	tree_deciduous_snow: require('@mappedin/3d-assets/inline/tree_deciduous_snow.js').default,
	tree_palm: require('@mappedin/3d-assets/inline/tree_palm.js').default,
	tree_palm_short: require('@mappedin/3d-assets/inline/tree_palm_short.js').default,
	tree_pine: require('@mappedin/3d-assets/inline/tree_pine.js').default,
	tree_pine_short: require('@mappedin/3d-assets/inline/tree_pine_short.js').default,
	truck: require('@mappedin/3d-assets/inline/truck.js').default,
	tv: require('@mappedin/3d-assets/inline/tv.js').default,
	vending_machine: require('@mappedin/3d-assets/inline/vending_machine.js').default,
	whiteboard: require('@mappedin/3d-assets/inline/whiteboard.js').default,
};

interface PlacedModel {
	modelId: string;
	coordinate: { latitude: number; longitude: number; floorId: string; verticalOffset: number };
	rotation: [number, number, number];
	scale: [number, number, number];
	color: string;
	verticalOffset: number;
}

function ModelsSetup() {
	const { mapView } = useMap();
	const [status, setStatus] = useState('Placing models...');

	useEffect(() => {
		let cancelled = false;
		(async () => {
			let placed = 0;
			for (const model of positions.models as unknown as PlacedModel[]) {
				if (cancelled) return;
				const url = MODELS[model.modelId];
				if (!url) continue;
				await mapView.Models.add(
					{
						__type: 'coordinate',
						latitude: model.coordinate.latitude,
						longitude: model.coordinate.longitude,
						floorId: model.coordinate.floorId,
						verticalOffset: model.verticalOffset,
					} as never,
					url,
					{
						interactive: true,
						rotation: model.rotation,
						scale: model.scale,
						verticalOffset: model.verticalOffset,
						material: {
							Default: { color: model.color },
							Fabric: { color: model.color },
							Mpdn_Logo: { color: model.color },
						},
					} as never,
				);
				placed += 1;
			}
			setStatus(`${placed} models placed. Click one to remove it.`);
		})();
		return () => {
			cancelled = true;
		};
	}, [mapView]);

	useMapViewEvent('click', event => {
		const model = event.models?.[0];
		if (model) void mapView.Models.remove(model);
	});

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.body}>{status}</Text>
		</View>
	);
}

export default function ModelsDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Models' }} />
			<MapScreen mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '64ef49e662fd90fe020bee61',
		}}>
				<ModelsSetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	banner: {
		position: 'absolute',
		top: 8,
		left: 8,
		width: 280,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: 'rgba(255,255,255,0.94)',
	},
	body: { fontSize: 13, color: '#374151' },
});
