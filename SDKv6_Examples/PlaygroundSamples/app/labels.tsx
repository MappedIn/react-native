import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMap, useMapViewEvent } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

const COLORS = ['#FF610A', '#4248ff', '#891244', '#219ED4'];
const ICON = `<svg width="92" height="92" viewBox="-17 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M53.99 28.0973H44.3274C41.8873 28.0973 40.7161 29.1789 40.7161 31.5387V61.1837L21.0491 30.7029C19.6827 28.5889 18.8042 28.1956 16.0714 28.0973H6.5551C4.01742 28.0973 2.84619 29.1789 2.84619 31.5387V87.8299C2.84619 90.1897 4.01742 91.2712 6.5551 91.2712H16.2178C18.7554 91.2712 19.9267 90.1897 19.9267 87.8299V58.3323L39.6912 88.6656C41.1553 90.878 41.9361 91.2712 44.669 91.2712H54.0388C56.5765 91.2712 57.7477 90.1897 57.7477 87.8299V31.5387C57.6501 29.1789 56.4789 28.0973 53.99 28.0973Z" fill="white"/><path d="M11.3863 21.7061C17.2618 21.7061 22.025 16.9078 22.025 10.9887C22.025 5.06961 17.2618 0.27124 11.3863 0.27124C5.51067 0.27124 0.747559 5.06961 0.747559 10.9887C0.747559 16.9078 5.51067 21.7061 11.3863 21.7061Z" fill="white"/></g><defs><clipPath id="clip0"><rect width="57" height="91" fill="white" transform="translate(0.747559 0.27124)"/></clipPath></defs></svg>`;

function LabelsSetup() {
	const { mapData, mapView } = useMap();

	useEffect(() => {
		let cancelled = false;
		(async () => {
			for (const space of mapData.getByType('space')) {
				if (cancelled || !space.name) continue;
				await mapView.Labels.add(space, space.name, {
					interactive: true,
					appearance: { color: COLORS[Math.floor(Math.random() * COLORS.length)], icon: space.images[0]?.url ?? ICON },
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	useMapViewEvent('click', event => {
		const label = event.labels?.[0];
		if (label) void mapView.Labels.remove(label);
	});

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.title}>Labels</Text>
			<Text style={styles.body}>Labels with custom styling are added to each space on the map with a name. Click on a label to remove it.</Text>
		</View>
	);
}

export default function LabelsDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Labels' }} />
			<MapScreen
				mapData={{
					// See Demo API Key Terms and Conditions
					// https://developer.mappedin.com/docs/demo-keys-and-maps
					key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
					secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
					mapId: '660c0c6e7c0c4fe5b4cc484c',
				}}
			>
				<LabelsSetup />
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
	title: { fontSize: 20, fontWeight: '700', color: '#111827' },
	body: { fontSize: 14, color: '#6b7280', marginTop: 2 },
});
