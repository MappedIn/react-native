import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMapData } from '@mappedin/mappedin-js';
import { EventsManager, type EventMetaData } from '@mappedin/events';

// See Demo API Key Terms and Conditions
// https://developer.mappedin.com/docs/demo-keys-and-maps
const KEY = '5eab30aa91b055001a68e996';
const SECRET = 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1';
const MAP_ID = 'mappedin-demo-mall';

function dateRange(event: EventMetaData) {
	const startInvalid = Number.isNaN(event.startDate.getTime());
	const endInvalid = Number.isNaN(event.endDate.getTime());
	if (startInvalid && endInvalid) return '';
	const start = startInvalid ? '' : event.startDate.toISOString().slice(0, 10);
	const end = endInvalid ? '' : event.endDate.toISOString().slice(0, 10);
	if (!start || !end || start === end) return start || end;
	return `${start} — ${end}`;
}

export default function EventsDemo() {
	const [status, setStatus] = useState('Loading events...');
	const [events, setEvents] = useState<EventMetaData[]>([]);

	useEffect(() => {
		let cancelled = false;
		void getMapData({ key: KEY, secret: SECRET, mapId: MAP_ID })
			.then(async mapData => {
				const manager = new EventsManager(mapData);
				await manager.load();
				if (!cancelled) {
					setEvents(manager.events);
					setStatus(
						manager.events.length
							? `${manager.events.length} Event${manager.events.length === 1 ? '' : 's'}`
							: 'No events found for this venue.',
					);
				}
			})
			.catch(() => {
				if (!cancelled) setStatus('Failed to load events');
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<Stack.Screen options={{ title: 'Events' }} />
			<ScrollView style={styles.list} contentContainerStyle={styles.content}>
				<Text style={styles.header}>{status}</Text>
				{events.map(event => (
					<View key={event.id} style={styles.card}>
						{event.image?.url ? <Image source={{ uri: event.image.url }} style={styles.image} resizeMode="cover" /> : null}
						<View style={styles.info}>
							<Text style={styles.name}>{event.name}</Text>
							{dateRange(event) ? <Text style={styles.when}>{dateRange(event)}</Text> : null}
							{event.description ? (
								<Text style={styles.description} numberOfLines={4}>
									{event.description}
								</Text>
							) : null}
						</View>
					</View>
				))}
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	list: { flex: 1, backgroundColor: '#f5f5f5' },
	content: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
	header: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 16 },
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
	name: { fontSize: 18, color: '#222', marginBottom: 4 },
	when: { fontSize: 13, color: '#888', marginBottom: 8 },
	description: { fontSize: 14, color: '#666' },
});
