import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMap } from '@mappedin/react-native-sdk';
import type { EnterpriseLocation } from '@mappedin/mappedin-js';
import { MapScreen } from '../components/map-screen';

type Item =
	| { kind: 'suggestion'; id: string; text: string }
	| { kind: 'location'; id: string; name: string; description?: string; location: EnterpriseLocation };

function locationItem(location: EnterpriseLocation, score = 0): Item {
	return { kind: 'location', id: `${location.id}-${score}`, name: location.name, description: location.description, location };
}

function SearchSetup() {
	const { mapData, mapView } = useMap();
	const [term, setTerm] = useState('');
	const [items, setItems] = useState<Item[]>([]);
	const [selected, setSelected] = useState<EnterpriseLocation | null>(null);

	useEffect(() => {
		void mapData.Search.enable();
		void mapView.auto();
	}, [mapData, mapView]);

	useEffect(() => {
		if (!selected) return;
		void mapView.Camera.focusOn(selected).then(async () => {
			for (const space of selected.spaces) {
				await mapView.updateState(space, { color: '#BF4320' });
			}
		});
	}, [selected, mapView]);

	const onChange = (value: string) => {
		setTerm(value);
		const query = value.trim();
		if (!query) {
			setItems([]);
			return;
		}
		void mapData.Search.suggest(query).then(suggestions => {
			setItems((suggestions ?? []).map(item => ({ kind: 'suggestion', id: item.suggestion, text: item.suggestion })));
		});
	};

	const open = async (item: Item) => {
		if (item.kind === 'suggestion') {
			setTerm(item.text);
			const result = await mapData.Search.query(item.text);
			setItems(
				[...(result.enterpriseLocations ?? [])]
					.sort((a, b) => b.score - a.score)
					.map(hit => locationItem(hit.item, hit.score)),
			);
			return;
		}
		setSelected(item.location);
	};

	return (
		<View style={styles.card} pointerEvents="box-none">
			<TextInput
				style={styles.input}
				placeholder="Search..."
				value={term}
				onChangeText={onChange}
				autoCorrect={false}
				autoCapitalize="none"
			/>
			<FlatList
				data={items.slice(0, 8)}
				keyExtractor={item => item.id}
				keyboardShouldPersistTaps="handled"
				style={styles.list}
				renderItem={({ item }) => (
					<Pressable style={styles.row} onPress={() => void open(item)}>
						<Text style={styles.name} numberOfLines={1}>
							{item.kind === 'suggestion' ? item.text : item.name}
						</Text>
						{item.kind === 'location' && item.description ? (
							<Text style={styles.description} numberOfLines={1}>
								{item.description}
							</Text>
						) : null}
					</Pressable>
				)}
			/>
		</View>
	);
}

export default function SearchDemo() {
	return (
		<>
			<Stack.Screen options={{ title: 'Search' }} />
			<MapScreen
				mapData={{
					// See Demo API Key Terms and Conditions
					// https://developer.mappedin.com/docs/demo-keys-and-maps
					key: '5eab30aa91b055001a68e996',
					secret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
					mapId: 'mappedin-demo-mall',
				}}
			>
				<SearchSetup />
			</MapScreen>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		position: 'absolute',
		top: 12,
		left: 12,
		width: 320,
		maxHeight: '55%',
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: 'rgba(255,255,255,0.96)',
	},
	input: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
	list: { flexGrow: 0 },
	row: { paddingHorizontal: 12, paddingVertical: 8 },
	name: { fontSize: 14, fontWeight: '600', color: '#111827' },
	description: { fontSize: 12, color: '#6b7280', marginTop: 1 },
});
