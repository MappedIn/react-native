import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, Stack, type Href } from 'expo-router';
import { DEMOS } from '../constants/demos';

export default function Index() {
	return (
		<View style={styles.container}>
			<Stack.Screen options={{ title: 'Mappedin SDK Samples' }} />
			<FlatList
				data={DEMOS}
				keyExtractor={item => item.slug}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => (
					<Link href={`/${item.slug}` as Href} asChild>
						<Pressable style={styles.card}>
							<View style={styles.rowText}>
								<Text style={styles.title}>{item.title}</Text>
								<Text style={styles.description}>{item.description}</Text>
							</View>
							<Text style={styles.chevron}>›</Text>
						</Pressable>
					</Link>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f3f4f6' },
	list: { padding: 16, gap: 10, width: '100%', maxWidth: 720, alignSelf: 'center' },
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	rowText: { flex: 1 },
	title: { fontSize: 16, fontWeight: '600', color: '#111827' },
	description: { fontSize: 13, color: '#6b7280', marginTop: 2 },
	chevron: { fontSize: 22, color: '#9ca3af', marginLeft: 12 },
});
