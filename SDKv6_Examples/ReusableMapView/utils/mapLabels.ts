import type { MapViewControl } from "@mappedin/react-native-sdk";
import type {
  EnterpriseCategory,
  EnterpriseLocation,
  LabelAppearance,
} from "@mappedin/mappedin-js";
import { IconService } from "@mappedin/icons";

let iconService: IconService | null = null;

function getIconService(): IconService {
  if (!iconService) {
    try {
      iconService = IconService.getInstance();
    } catch {
      iconService = IconService.initialize();
    }
  }
  return iconService;
}

/** Cache of category icon name -> white SVG data URI, shared across screens. */
const whiteIconCache = new Map<string, string>();

/** Cache of `${iconName}|${color}` -> recolored raw SVG markup. */
const coloredSvgCache = new Map<string, string>();

/** Forces every fill in the SVG markup to white and encodes it as a data URI. */
function svgToWhiteDataUri(svg: string): string {
  const white = svg.replace(/fill="[^"]*"/g, 'fill="#ffffff"');
  return `data:image/svg+xml;utf8,${encodeURIComponent(white)}`;
}

/** Recolors every fill in the SVG markup to the given color. */
function recolorSvg(svg: string, color: string): string {
  return svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
}

/** Encodes raw SVG markup as a data URI usable in an HTML `<img src>`. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Fetches a category's default-list icon and recolors it to `color`, returning
 * the raw SVG markup (usable with react-native-svg's SvgXml or, via
 * {@link svgToDataUri}, an HTML `<img>`). Results are cached per name+color.
 * Returns undefined when the category has no icon or the fetch fails.
 */
export async function fetchCategoryIconSvg(
  category: EnterpriseCategory,
  color: string
): Promise<string | undefined> {
  const name = category.iconFromDefaultList;
  if (!name) {
    return undefined;
  }

  const key = `${name}|${color}`;
  const cached = coloredSvgCache.get(key);
  if (cached) {
    return cached;
  }

  const service = getIconService();
  try {
    const fetchName = service.getSmallIcon(name)?.name ?? name;
    const svg = await service.fetchSvg(fetchName);
    const colored = recolorSvg(svg, color);
    coloredSvgCache.set(key, colored);
    return colored;
  } catch {
    return undefined;
  }
}

/**
 * Fetches and white-recolors the SVG for each unique category icon used by the
 * given locations, returning a map of category icon name -> white data URI.
 * Prefers the small (label-optimized) icon variant when one exists.
 */
export async function prepareCategoryIcons(
  locations: EnterpriseLocation[]
): Promise<Map<string, string>> {
  const service = getIconService();

  const names = new Set<string>();
  for (const location of locations) {
    const name = location.categories[0]?.iconFromDefaultList;
    if (name) {
      names.add(name);
    }
  }

  const result = new Map<string, string>();
  await Promise.all(
    [...names].map(async (name) => {
      const cached = whiteIconCache.get(name);
      if (cached) {
        result.set(name, cached);
        return;
      }
      try {
        const fetchName = service.getSmallIcon(name)?.name ?? name;
        const svg = await service.fetchSvg(fetchName);
        const dataUri = svgToWhiteDataUri(svg);
        whiteIconCache.set(name, dataUri);
        result.set(name, dataUri);
      } catch {
        // Leave it out; the label will fall back to a plain (non-white) URL.
      }
    })
  );

  return result;
}

/** Resolves a category's icon, preferring a prepared white data URI. */
function resolveCategoryIconUrl(
  category: EnterpriseCategory,
  whiteIcons?: Map<string, string>
): string | undefined {
  const name = category.iconFromDefaultList;
  if (name) {
    const white = whiteIcons?.get(name);
    if (white) {
      return white;
    }
  }

  if (category.icon) {
    return category.icon;
  }

  if (!name) {
    return undefined;
  }

  const service = getIconService();
  try {
    return service.getSmallIcon(name)?.url ?? service.getByName(name).url;
  } catch {
    return undefined;
  }
}

/**
 * Adds a Label for each enterprise location, styled with its primary category:
 * a white category icon on a pin tinted to the category color, with matching
 * text color. Pass the result of {@link prepareCategoryIcons} for white icons.
 */
export function addLocationLabels(
  mapView: MapViewControl,
  locations: EnterpriseLocation[],
  whiteIcons?: Map<string, string>
): void {
  for (const location of locations) {
    const target = location.spaces[0] ?? location.coordinates[0];
    if (!target) {
      continue;
    }

    const category = location.categories[0];
    const appearance: LabelAppearance = {};

    if (category) {
      const iconUrl = resolveCategoryIconUrl(category, whiteIcons);
      if (iconUrl) {
        appearance.icon = iconUrl;
        appearance.iconFit = "contain";
      }
      if (category.color) {
        appearance.pinColor = category.color;
        appearance.textColor = category.color;
      }
    }

    mapView.Labels.add(target, location.name, { appearance });
  }
}
