/**
 * The sample catalogue. Mirrors the iOS and Android PlaygroundSamples menus one-to-one.
 *
 * `slug` must match the route filename in `app/`. Descriptions match the Android README so
 * the three SDK sample apps stay in lockstep.
 */
export interface Demo {
	/** Display name, identical to the iOS and Android sample menus. */
	title: string;
	/** Expo Router route filename in `app/`, without extension. */
	slug: string;
	/** One-line description of what the sample demonstrates. */
	description: string;
}

export const DEMOS: Demo[] = [
	{
		title: 'Areas & Shapes',
		slug: 'areas-shapes',
		description: 'Demonstrates using shapes to show areas and route directions around closed areas.',
	},
	{
		title: 'Blue Dot',
		slug: 'blue-dot',
		description: "Demonstrates using Blue Dot to show the user's position on the map.",
	},
	{
		title: 'Blue Dot Manual Positioning',
		slug: 'blue-dot-manual-positioning',
		description: 'Demonstrates how to report a position to the Mappedin location fusion engine with a confidence score.',
	},
	{
		title: 'Blue Dot Path Tethering',
		slug: 'blue-dot-path-tethering',
		description: "Demonstrates how to tether a navigation path to a user's location (Blue Dot) as they move.",
	},
	{
		title: 'Building & Floor Selection',
		slug: 'building-floor-selection',
		description: 'Demonstrates switching between maps for venues with multiple floors and or multiple buildings.',
	},
	{ title: 'Camera', slug: 'camera', description: 'Demonstrates how to move the camera.' },
	{
		title: 'Colors & Textures',
		slug: 'colors-textures',
		description: 'Demonstrates how to apply custom colors and textures to the map.',
	},
	{ title: 'Display a Map', slug: 'display-map', description: 'The most basic example to show a map.' },
	{ title: 'Dynamic Focus', slug: 'dynamic-focus', description: 'Demonstrates how to use Dynamic Focus.' },
	{
		title: 'Dynamic Focus (Manual)',
		slug: 'dynamic-focus-manual',
		description: 'Demonstrates how to create a custom Dynamic Focus effect.',
	},
	{ title: 'Events', slug: 'events', description: 'Demonstrates how to use events created in Mappedin CMS.' },
	{ title: 'Icons', slug: 'icons', description: 'Demonstrates how use Mappedin icons.' },
	{ title: 'Image3D', slug: 'image3d', description: 'Demonstrates how to add images on a map.' },
	{
		title: 'Interactivity',
		slug: 'interactivity',
		description: 'Demonstrates how to capture and act on touch events.',
	},
	{ title: 'Labels', slug: 'labels', description: 'Demonstrates adding rich labels to the map.' },
	{
		title: 'Locations',
		slug: 'locations',
		description: 'Demonstrates using location profiles and categories.',
	},
	{ title: 'Markers', slug: 'markers', description: 'Demonstrates adding HTML Markers to the map.' },
	{ title: 'Models', slug: 'models', description: 'Demonstrates adding 3D models to the map.' },
	{ title: 'Multi-Floor View', slug: 'multi-floor-view', description: 'Demonstrates using multi floor view.' },
	{
		title: 'Navigation',
		slug: 'navigation',
		description: 'Demonstrates wayfinding and navigation across multiple floors.',
	},
	{ title: 'Paths', slug: 'paths', description: 'Demonstrates how to draw a path between two rooms.' },
	{
		title: 'Query',
		slug: 'query',
		description: 'Demonstrates how to find the nearest room based on a coordinate and click event.',
	},
	{
		title: 'Reusable MapView',
		slug: 'reusable-map-view',
		description: 'Demonstrates how to reuse the same MapView instance on multiple screens for faster loading.',
	},
	{ title: 'Search', slug: 'search', description: 'Demonstrates how to use the suggest and search feature.' },
	{ title: 'Stacked Maps', slug: 'stacked-maps', description: 'Demonstrates how to use the stacked maps.' },
	{ title: 'Text3D', slug: 'text3d', description: 'Demonstrates how to use Text3D labels.' },
	{ title: 'Turn by Turn', slug: 'turn-by-turn', description: 'Demonstrates how to use turn by turn directions.' },
];
