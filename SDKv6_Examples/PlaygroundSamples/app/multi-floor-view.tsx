import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useMap } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

function MultiFloorSetup() {
	const { mapData, mapView } = useMap();

	useEffect(() => {
		const floors = mapData.getByType('floor');
		const floor9 = floors.find(floor => floor.elevation === 9);
		const floor6 = floors.find(floor => floor.elevation === 6);
		if (floor9) void mapView.setFloor(floor9.id);
		if (floor6) void mapView.updateState(floor6, { geometry: { visible: true } } as never);
	}, [mapData, mapView]);

	return null;
}

export default function MultiFloorViewDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Multi-Floor View' }} />
			<MapScreen
				mapData={{
			// See Demo API Key Terms and Conditions
			// https://developer.mappedin.com/docs/demo-keys-and-maps
			key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
			secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
			mapId: '67a6641530e940000bac3c1a',
		}}
				options={{
					multiFloorView: { enabled: true, floorGap: 10, updateCameraElevationOnFloorChange: true },
				}}
			>
				<MultiFloorSetup />
			</MapScreen>
		</>
	);
}
