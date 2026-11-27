import { Stack } from 'expo-router';
import { createElement, useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { IconCategory, IconService, IconSubtype, IconType, type MappedinIcon } from '@mappedin/icons';
import { useMap } from '@mappedin/react-native-sdk';
import { MapScreen } from '../components/map-screen';

const TABS = ['Gallery', 'Color', 'Prefetch', 'Enterprise'] as const;
const SWATCHES = ['#333333', '#ff5733', '#2266ff', '#1faa59', '#a855f7', '#e91e63'];
const PREFETCH_NAMES = ['information', 'elevator-up', 'book'];

type Group = { title: string; items: MappedinIcon[]; level?: 'h2' | 'h3' };

function icons() {
	try {
		return IconService.getInstance();
	} catch {
		return IconService.initialize();
	}
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function sheetHtml(groups: Group[], markup: Record<string, string>, color: string, heading?: string, note?: string) {
	const body = groups
		.map(group => {
			const headingTag = group.level === 'h3' ? 'h3' : 'h2';
			const title = group.title ? `<${headingTag}>${escapeHtml(group.title)}${group.items.length ? ` (${group.items.length})` : ''}</${headingTag}>` : '';
			const tiles = group.items
				.map(icon => {
					const svg = markup[icon.name]?.replaceAll('currentColor', color) ?? '';
					const tags = icon.tags.length ? icon.tags.join(', ') : 'none';
					return `<a class="tile" href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer">
						<div class="glyph">${svg}</div>
						<div class="name">${escapeHtml(icon.name)}</div>
						<div class="meta">Tags: ${escapeHtml(tags)}</div>
						${icon.smallIcon ? `<div class="meta">Small: ${escapeHtml(icon.smallIcon)}</div>` : ''}
					</a>`;
				})
				.join('');
			return `${title}${tiles ? `<div class="grid">${tiles}</div>` : ''}`;
		})
		.join('');
	return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
	body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; background: #fff; color: #111; }
	h1 { font-size: 28px; margin: 0 0 8px; }
	h2 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 4px; margin: 16px 0 8px; }
	h3 { font-size: 16px; color: #555; font-weight: 500; margin: 8px 0; }
	.note { font-size: 13px; color: #4b5563; }
	.grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
	.tile { width: 180px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
	.glyph { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
	.glyph svg { width: 40px; height: 40px; }
	.name { font-size: 12px; font-weight: 600; color: #0645ad; text-align: center; text-decoration: underline; word-break: break-all; }
	.meta { font-size: 10px; color: #888; text-align: center; }
</style>
</head>
<body>
	${heading ? `<h1>${escapeHtml(heading)}</h1>` : ''}
	${note ? `<p class="note">${escapeHtml(note)}</p>` : ''}
	${body}
</body>
</html>`;
}

function useSvgMarkup(names: string[]) {
	const key = names.join('\n');
	const [markup, setMarkup] = useState<Record<string, string> | null>(null);

	useEffect(() => {
		let cancelled = false;
		setMarkup(null);
		const service = icons();
		const requested = key ? key.split('\n') : [];
		void service
			.prefetch(requested)
			.then(async () => {
				const next: Record<string, string> = {};
				await Promise.all(
					requested.map(async name => {
						next[name] = await service.fetchSvg(name);
					}),
				);
				if (!cancelled) setMarkup(next);
			})
			.catch(() => {
				if (!cancelled) setMarkup({});
			});
		return () => {
			cancelled = true;
		};
	}, [key]);

	return markup;
}

function IconSheet({ groups, color, heading, note }: { groups: Group[]; color: string; heading?: string; note?: string }) {
	const names = useMemo(() => groups.flatMap(group => group.items.map(icon => icon.name)), [groups]);
	const markup = useSvgMarkup(names);
	const html = useMemo(
		() => (markup ? sheetHtml(groups, markup, color, heading, note) : null),
		[groups, markup, color, heading, note],
	);

	if (!html) return <Text style={styles.note}>Loading icons...</Text>;
	if (Platform.OS === 'web') {
		return createElement('iframe', { srcDoc: html, style: { flex: 1, width: '100%', height: '100%', border: 'none' } });
	}
	return (
		<WebView
			style={styles.fill}
			originWhitelist={['*']}
			source={{ html }}
			setSupportMultipleWindows={false}
			onShouldStartLoadWithRequest={request => {
				if (request.url.startsWith('http')) {
					void Linking.openURL(request.url);
					return false;
				}
				return true;
			}}
		/>
	);
}

function Gallery() {
	const service = icons();
	const groups = useMemo(() => {
		const subtypes = [IconSubtype.Locations, IconSubtype.Amenities, IconSubtype.General, IconSubtype.System];
		return [
			{ title: 'Categories', items: [] },
			...subtypes.map(subtype => ({ title: subtype, items: service.getBySubtype(subtype), level: 'h3' as const })),
			...[IconType.Small, IconType.Input, IconType.Metadata].map(type => ({
				title: type,
				items: service.getByType(type),
			})),
		];
	}, [service]);

	return <IconSheet groups={groups} color="#606060" heading="Mappedin Icon Gallery" note="Tap an icon to open its SVG from the CDN." />;
}

function ColorPicker() {
	const [color, setColor] = useState(SWATCHES[0]);
	const groups = useMemo(() => [{ title: '', items: icons().getByType(IconType.Categories).slice(0, 40) }], []);

	return (
		<View style={styles.fill}>
			<Text style={styles.note}>Icons use fill="currentColor". Tap a swatch to recolor.</Text>
			<View style={styles.row}>
				{SWATCHES.map(swatch => (
					<Pressable key={swatch} style={[styles.swatch, { backgroundColor: swatch }]} onPress={() => setColor(swatch)} />
				))}
			</View>
			<IconSheet groups={groups} color={color} />
		</View>
	);
}

function Prefetch() {
	const [status, setStatus] = useState('Tap a button to begin.');
	const [shown, setShown] = useState<MappedinIcon[]>([]);
	const service = icons();
	const groups = useMemo(() => [{ title: '', items: shown }], [shown]);

	const show = (next: MappedinIcon[], message: string) => {
		setShown(next.slice(0, 20));
		setStatus(message);
	};

	return (
		<View style={styles.fill}>
			<View style={styles.buttons}>
				<Pressable
					style={styles.btn}
					onPress={() => {
						void service.prefetch(PREFETCH_NAMES).then(() => {
							show(
								PREFETCH_NAMES.map(name => service.getByName(name)),
								`Prefetched ${PREFETCH_NAMES.length}. isCached("${PREFETCH_NAMES[0]}") = ${service.isCached(PREFETCH_NAMES[0])}`,
							);
						});
					}}
				>
					<Text style={styles.btnText}>Prefetch by names</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						void service.prefetchByType(IconType.Small).then(() => {
							const group = service.getByType(IconType.Small);
							show(group, `Prefetched ${group.length} Small icons.`);
						});
					}}
				>
					<Text style={styles.btnText}>Prefetch by type (Small)</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						void service.prefetchBySubtype(IconSubtype.Amenities).then(() => {
							const group = service.getBySubtype(IconSubtype.Amenities);
							show(group, `Prefetched ${group.length} Amenities icons.`);
						});
					}}
				>
					<Text style={styles.btnText}>Prefetch by subtype (Amenities)</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						void service.prefetchByCategory(IconCategory.FoodAndDrink).then(() => {
							const group = service.getByCategory(IconCategory.FoodAndDrink);
							show(group, `Prefetched ${group.length} Food and drink icons.`);
						});
					}}
				>
					<Text style={styles.btnText}>Prefetch by category (Food and drink)</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						const name = PREFETCH_NAMES[0];
						service.clearCache();
						const uncachedStart = Date.now();
						void service.fetchSvg(name).then(() => {
							const uncached = Date.now() - uncachedStart;
							const cachedStart = Date.now();
							void service.fetchSvg(name).then(() => {
								setStatus(`Uncached: ${uncached} ms, cached: ${Date.now() - cachedStart} ms`);
							});
						});
					}}
				>
					<Text style={styles.btnText}>Cached vs uncached fetch</Text>
				</Pressable>
				<Pressable
					style={styles.btn}
					onPress={() => {
						service.clearCache();
						setShown([]);
						setStatus(`Cache cleared. isCached("${PREFETCH_NAMES[0]}") = ${service.isCached(PREFETCH_NAMES[0])}`);
					}}
				>
					<Text style={styles.btnText}>Clear cache</Text>
				</Pressable>
			</View>
			<Text style={styles.status}>{status}</Text>
			{shown.length ? <IconSheet groups={groups} color="#606060" /> : null}
		</View>
	);
}

function EnterpriseLabels() {
	const { mapData, mapView } = useMap();
	const [status, setStatus] = useState('Adding category icons...');

	useEffect(() => {
		let cancelled = false;
		const service = icons();
		(async () => {
			let labeled = 0;
			for (const location of mapData.getByType('enterprise-location')) {
				if (cancelled || !location.name) continue;
				const category = mapData.getById('enterprise-category', location.categories[0]?.id ?? '');
				const iconName = category?.iconFromDefaultList || 'information';
				const small = service.getByName(iconName).smallIcon ?? 'small-information-desk';
				const svg = (await service.fetchSvg(small)).replaceAll('currentColor', '#fafafa');
				for (const space of location.spaces) {
					if (!space) continue;
					await mapView.Labels.add(space, location.name, {
						appearance: { color: category?.color ?? 'black', icon: svg, iconPadding: 10 },
					});
					labeled += 1;
				}
			}
			if (!cancelled) setStatus(labeled ? `${labeled} spaces labeled` : 'No enterprise locations with spaces');
		})().catch(error => setStatus(`Icons failed: ${error}`));
		return () => {
			cancelled = true;
		};
	}, [mapData, mapView]);

	return (
		<View style={styles.banner} pointerEvents="none">
			<Text style={styles.bannerText}>{status}</Text>
		</View>
	);
}

export default function IconsDemo() {
	const [tab, setTab] = useState<(typeof TABS)[number]>('Gallery');

	return (
		<View style={styles.fill}>
			<Stack.Screen options={{ title: 'Icons' }} />
			<View style={styles.tabs}>
				{TABS.map(name => (
					<Pressable key={name} style={[styles.tab, tab === name && styles.tabOn]} onPress={() => setTab(name)}>
						<Text style={styles.tabText}>{name}</Text>
					</Pressable>
				))}
			</View>
			{tab === 'Gallery' ? <Gallery /> : null}
			{tab === 'Color' ? <ColorPicker /> : null}
			{tab === 'Prefetch' ? <Prefetch /> : null}
			{tab === 'Enterprise' ? (
				<MapScreen
					mapData={{
						// See Demo API Key Terms and Conditions
						// https://developer.mappedin.com/docs/demo-keys-and-maps
						key: '5eab30aa91b055001a68e996',
						secret: 'RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1',
						mapId: 'mappedin-demo-mall',
					}}
				>
					<EnterpriseLabels />
				</MapScreen>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	fill: { flex: 1, backgroundColor: '#fff' },
	tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
	tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
	tabOn: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
	tabText: { fontSize: 13, fontWeight: '600', color: '#111827' },
	note: { fontSize: 13, color: '#4b5563', padding: 12 },
	row: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 8 },
	swatch: { width: 36, height: 36, borderRadius: 6 },
	buttons: { padding: 12, gap: 8 },
	btn: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
	btnText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
	status: { fontFamily: 'Courier', fontSize: 12, color: '#4b5563', paddingHorizontal: 12, paddingBottom: 8 },
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
	bannerText: { fontSize: 13, color: '#374151' },
});
