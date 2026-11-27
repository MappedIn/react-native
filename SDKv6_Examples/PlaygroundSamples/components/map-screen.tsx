import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MapView, type MapViewProps } from '@mappedin/react-native-sdk';
import type { TShow3DMapOptions } from '@mappedin/mappedin-js';

const EMPTY_OPTIONS = {};
const EMPTY_FALLBACK = <View />;

export interface MapScreenProps {
	/** Map data source, either fetch options or a pre-loaded MapData instance. */
	mapData: MapViewProps['mapData'];
	/** Optional map view options. */
	options?: TShow3DMapOptions;
	/** Called once the map is ready. */
	onMapReady?: () => void;
	/** Rendered inside the MapView context, so children may use `useMap()`. */
	children?: ReactNode;
}

/**
 * Standard full-screen `MapView` with loading and error fallbacks.
 *
 * Every sample screen uses this so the map fills the screen identically across demos.
 */
export function MapScreen({ mapData, options, onMapReady, children }: MapScreenProps) {
	const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
	const [frame, setFrame] = useState({ width: 0, height: 0 });
	const handleReady = useCallback(() => {
		setPhase('ready');
		onMapReady?.();
	}, [onMapReady]);
	const handleError = useCallback(() => setPhase('error'), []);

	return (
		<View
			style={styles.container}
			onLayout={event => {
				const next = event.nativeEvent.layout;
				setFrame(prev => (prev.width === next.width && prev.height === next.height ? prev : next));
			}}
		>
			<MapView
				style={styles.map}
				options={options ?? EMPTY_OPTIONS}
				mapData={mapData}
				fallback={EMPTY_FALLBACK}
				onMapReady={handleReady}
				onError={handleError}
			>
				{/*
				 * `MapViewProps.children` resolves against a second `@types/react` copy in this
				 * workspace (19.0.14 for the RN 0.79 packages, 19.2.18 for this app), so the two
				 * `ReactNode` definitions are structurally incompatible. The runtime value is fine.
				 */}
				{children as unknown as never}
			</MapView>
			{phase === 'ready' || frame.height === 0 ? null : (
				<View style={[styles.fallback, frame]} pointerEvents="none">
					{phase === 'error' ? (
						<Text style={styles.fallbackText}>Couldn't load the map.</Text>
					) : (
						<>
							<ActivityIndicator size="large" color="#0066cc" />
							<Text style={styles.fallbackText}>Loading map...</Text>
						</>
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#ffffff' },
	map: { flex: 1 },
	fallback: {
		position: 'absolute',
		top: 0,
		left: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
	},
	fallbackText: { marginTop: 12, fontSize: 16, color: '#4b5563' },
});
