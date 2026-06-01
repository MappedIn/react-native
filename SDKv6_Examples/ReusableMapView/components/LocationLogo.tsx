import { Component, ReactNode, useEffect, useState } from "react";
import { Image, View } from "react-native";
import { SvgXml } from "react-native-svg";

function isSvgUri(uri: string): boolean {
  return uri.startsWith("data:image/svg") || /\.svg($|\?)/i.test(uri);
}

/**
 * Safety net: if react-native-svg's SvgXml throws while parsing an unusual SVG,
 * render an empty placeholder of the same size instead of crashing the row.
 */
class SvgBoundary extends Component<
  { svgKey: string; size: number; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev: { svgKey: string }) {
    if (prev.svgKey !== this.props.svgKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <View style={{ width: this.props.size, height: this.props.size }} />;
    }
    return this.props.children;
  }
}

/**
 * Fetches a remote SVG as text and renders it via SvgXml. We avoid
 * react-native-svg's <SvgUri>, whose internal remote fetch is unreliable under
 * the New Architecture; fetching ourselves and handing the markup to SvgXml is
 * more robust.
 */
function RemoteSvg({ uri, size }: { uri: string; size: number }) {
  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setXml(null);
    fetch(uri)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setXml(text);
      })
      .catch(() => {
        if (!cancelled) setXml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (!xml) {
    return null;
  }
  return <SvgXml xml={xml} width={size} height={size} />;
}

function decodeSvgDataUri(uri: string): string {
  const comma = uri.indexOf(",");
  const payload = uri.slice(comma + 1);
  if (/;base64/i.test(uri.slice(0, comma))) {
    return globalThis.atob(payload);
  }
  return decodeURIComponent(payload);
}

/**
 * Renders a location logo. React Native's `Image` cannot display SVGs, so SVG
 * URIs (remote `.svg` or inline `data:image/svg`) are rendered with
 * react-native-svg, while raster images fall back to `Image`.
 */
export function LocationLogo({ uri, size }: { uri: string; size: number }) {
  if (isSvgUri(uri)) {
    const svg = uri.startsWith("data:") ? (
      <SvgXml xml={decodeSvgDataUri(uri)} width={size} height={size} />
    ) : (
      <RemoteSvg uri={uri} size={size} />
    );
    return (
      <SvgBoundary svgKey={uri} size={size}>
        {svg}
      </SvgBoundary>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
