import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMapData, type LocationCategory, type LocationProfile } from '@mappedin/mappedin-js';

// See Demo API Key Terms and Conditions
// https://developer.mappedin.com/docs/demo-keys-and-maps
const KEY = 'mik_yeBk0Vf0nNJtpesfu560e07e5';
const SECRET = 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022';
const MAP_ID = '660c0c6e7c0c4fe5b4cc484c';

interface Section {
	id: string;
	parent: LocationCategory;
	child: LocationCategory;
	profiles: LocationProfile[];
}

export default function LocationsDemo() {
	const [status, setStatus] = useState('Loading categories...');
	const [sections, setSections] = useState<Section[]>([]);

	useEffect(() => {
		let cancelled = false;
		void getMapData({ key: KEY, secret: SECRET, mapId: MAP_ID })
			.then(mapData => {
				if (cancelled) return;
				const categories = mapData.getByType('location-category');
				const next = categories
					.filter(category => category.children.length > 0)
					.flatMap(parent =>
						parent.children.map(child => ({
							id: child.id,
							parent,
							child,
							profiles: child.locationProfiles.filter(profile => profile.name),
						})),
					);
				setSections(next);
				setStatus(next.length ? '' : 'No categories with children found');
			})
			.catch(() => {
				if (!cancelled) setStatus('Failed to load map data');
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<Stack.Screen options={{ title: 'Locations' }} />
			<ScrollView style={styles.list} contentContainerStyle={styles.content}>
				{status ? <Text style={styles.error}>{status}</Text> : null}
				{sections.map(section => (
					<View key={section.id} style={styles.section}>
						<View style={styles.titleRow}>
							{section.parent.icon ? <Image source={{ uri: section.parent.icon }} style={styles.icon} /> : null}
							<Text style={styles.title}>{section.parent.name}</Text>
							<Text style={styles.arrow}> → </Text>
							{section.child.icon ? <Image source={{ uri: section.child.icon }} style={styles.icon} /> : null}
							<Text style={styles.title}>{section.child.name}</Text>
						</View>
						<View style={styles.divider} />
						{section.profiles.map(profile => (
							<View key={profile.id} style={styles.card}>
								{profile.images[0]?.url ? <Image source={{ uri: profile.images[0].url }} style={styles.image} resizeMode="cover" /> : null}
								<View style={styles.info}>
									<Text style={styles.name}>{profile.name}</Text>
									{profile.description ? (
										<Text style={styles.description} numberOfLines={4}>
											{profile.description}
										</Text>
									) : null}
								</View>
							</View>
						))}
					</View>
				))}
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	list: { flex: 1, backgroundColor: '#f5f5f5' },
	content: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
	error: { fontSize: 16, color: '#dc2626', textAlign: 'center' },
	section: { marginBottom: 24 },
	titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 },
	icon: { width: 24, height: 24, marginRight: 8 },
	title: { fontSize: 16, color: '#333' },
	arrow: { fontSize: 16, color: '#666' },
	divider: { height: 2, backgroundColor: '#eee', marginBottom: 16 },
	card: {
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 4,
	},
	image: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#e0e0e0' },
	info: { padding: 16 },
	name: { fontSize: 18, color: '#222', marginBottom: 8 },
	description: { fontSize: 14, color: '#666' },
});
