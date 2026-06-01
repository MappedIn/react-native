import { useCallback, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMapData } from "@/context/MapDataContext";
import { useSharedMap } from "@/context/SharedMapContext";
import { LocationLogo } from "@/components/LocationLogo";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MAP_HEIGHT = Math.round(SCREEN_H * 0.42);
// Default header content height (excluding the status-bar inset), matching
// @react-navigation/elements' getDefaultHeaderHeight per platform: 44 on iOS,
// 56 on Android, 64 for the web header.
const HEADER_CONTENT_HEIGHT =
  Platform.OS === "ios" ? 44 : Platform.OS === "android" ? 56 : 64;
// How quickly the map cross-fades out as the iOS back-slide begins. Comfortably
// shorter than the native push/pop animation so the fade reads as part of it.
const MAP_FADE_OUT_MS = 220;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type HoursSpec = { dayOfWeek?: string[]; opens?: string; closes?: string };

function formatTime(value: string): string {
  const [hourStr, minuteStr] = value.split(":");
  const hour = Number(hourStr);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

function buildHoursByDay(specs: HoursSpec[]): Map<string, HoursSpec> {
  const byDay = new Map<string, HoursSpec>();
  for (const spec of specs) {
    for (const day of spec.dayOfWeek ?? []) {
      byDay.set(day, spec);
    }
  }
  return byDay;
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLocation } = useMapData();
  const {
    setActiveHost,
    setSelectedLocationId,
    setDetailFrame,
    detailMapOpacity,
    mapExpanded,
    setMapExpanded,
  } = useSharedMap();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const location = id ? getLocation(id) : undefined;

  // The map itself lives in ONE always-mounted "detail" host at the root. This
  // screen renders an empty placeholder where the map should appear and publishes
  // that slot's frame so the root can position the host over it. Because the
  // placeholder is a plain View (not a teleport host), unmounting this screen on
  // back-navigation never reparents the map — which is what crashed when each
  // screen owned its own PortalHost.
  //
  // The frame is COMPUTED, not measured: on Android `measureInWindow`/
  // `measureLayout` return coordinates relative to the screen fragment (below the
  // header) and don't account for the native-stack header, so the map would paint
  // over the header and hide the back button. The slot sits just below the header
  // (status-bar inset + header content height), or fills the screen when expanded.
  useEffect(() => {
    const frame = mapExpanded
      ? { x: 0, y: 0, width: SCREEN_W, height: SCREEN_H }
      : {
          x: 0,
          y: insets.top + HEADER_CONTENT_HEIGHT,
          width: SCREEN_W,
          height: MAP_HEIGHT,
        };
    setDetailFrame(frame);
  }, [id, mapExpanded, insets.top, setDetailFrame]);

  // The map's host lives at the root, so it can't slide along with this screen
  // during the native back transition — without help it would sit frozen in
  // place until the slide finishes, then blink out. On iOS we cross-fade it out
  // the moment the closing transition starts so the disappearance reads as part
  // of the slide. (Android's transition detaches promptly and never looks
  // frozen, so it's left on the simple focus/blur path.)
  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    const fadeTo = (toValue: number) =>
      Animated.timing(detailMapOpacity, {
        toValue,
        duration: MAP_FADE_OUT_MS,
        useNativeDriver: true,
      }).start();
    const onTransitionStart = (e: { data: { closing: boolean } }) => {
      if (e.data.closing) {
        fadeTo(0);
      }
    };
    // If an interactive swipe-back is cancelled, bring the map back.
    const onGestureCancel = () => fadeTo(1);
    const subs = [
      navigation.addListener("transitionStart" as never, onTransitionStart as never),
      navigation.addListener("gestureCancel" as never, onGestureCancel as never),
    ];
    return () => subs.forEach((unsub) => unsub());
  }, [navigation, detailMapOpacity]);

  // Claim the shared map into the "detail" host while focused, and hand it back
  // to the off-screen parking source on the way out. Both are permanently
  // mounted, so this is always a clean reparent between live hosts.
  useFocusEffect(
    useCallback(() => {
      // Reset opacity before claiming the map so it's fully visible on entry
      // (a previous exit may have faded it to 0).
      detailMapOpacity.setValue(1);
      setActiveHost("detail");
      setSelectedLocationId(id ?? null);
      return () => {
        setActiveHost("parking");
        setSelectedLocationId(null);
        // Collapse back to the inline map when leaving this screen.
        setMapExpanded(false);
      };
    }, [id, detailMapOpacity, setActiveHost, setSelectedLocationId, setMapExpanded])
  );

  if (!location) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: "Not found" }} />
        <Text style={styles.notFoundText}>Location not found.</Text>
      </View>
    );
  }

  const logoUri = location.logo ?? location.picture ?? undefined;
  const categories = location.categories;
  const phone = location.phone?.number;
  const website = location.social?.website;
  const hoursSpecs = (location.operationHours ?? []) as HoursSpec[];
  const hoursByDay = buildHoursByDay(hoursSpecs);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: location.name, headerShown: !mapExpanded }}
      />
      {/*
        Empty placeholder that reserves the map's on-screen slot. The actual map
        is teleported into the root-level "detail" host, which is positioned over
        the computed frame for this slot (see the detailFrame effect above).
      */}
      <View
        style={[styles.mapWrapper, mapExpanded && styles.mapWrapperExpanded]}
      />

      <ScrollView
        style={styles.details}
        contentContainerStyle={styles.detailsContent}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {logoUri ? (
              <LocationLogo uri={logoUri} size={60} />
            ) : (
              <Text style={styles.logoFallback}>
                {location.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{location.name}</Text>
            {categories[0]?.name ? (
              <Text style={styles.category}>{categories[0].name}</Text>
            ) : null}
          </View>
        </View>

        {location.description ? (
          <DetailSection title="About">
            <Text style={styles.description}>{location.description}</Text>
          </DetailSection>
        ) : null}

        {categories.length > 0 ? (
          <DetailSection title="Categories">
            <View style={styles.chips}>
              {categories.map((category) => (
                <View key={category.id} style={styles.chip}>
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: category.color ?? "#9ca3af" },
                    ]}
                  />
                  <Text style={styles.chipText}>{category.name}</Text>
                </View>
              ))}
            </View>
          </DetailSection>
        ) : null}

        {hoursByDay.size > 0 ? (
          <DetailSection title="Hours">
            {DAYS_OF_WEEK.map((day) => {
              const spec = hoursByDay.get(day);
              return (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>{day}</Text>
                  <Text style={styles.hoursValue}>
                    {spec?.opens && spec?.closes
                      ? `${formatTime(spec.opens)} – ${formatTime(spec.closes)}`
                      : "Closed"}
                  </Text>
                </View>
              );
            })}
          </DetailSection>
        ) : null}

        {phone || website ? (
          <DetailSection title="Contact">
            {phone ? (
              <Pressable
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${phone}`)}
              >
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{phone}</Text>
              </Pressable>
            ) : null}
            {website ? (
              <Pressable
                style={styles.contactRow}
                onPress={() => Linking.openURL(website)}
              >
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {website}
                </Text>
              </Pressable>
            ) : null}
          </DetailSection>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mapWrapper: {
    height: MAP_HEIGHT,
    backgroundColor: "#e8eaed",
  },
  mapWrapperExpanded: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_H,
    zIndex: 20,
    elevation: 20,
  },
  details: {
    flex: 1,
  },
  detailsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoFallback: {
    fontSize: 26,
    fontWeight: "700",
    color: "#6b7280",
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  category: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  hoursDay: {
    fontSize: 15,
    color: "#374151",
  },
  hoursValue: {
    fontSize: 15,
    color: "#6b7280",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  contactLabel: {
    fontSize: 15,
    color: "#6b7280",
  },
  contactValue: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "500",
    flexShrink: 1,
    marginLeft: 16,
    textAlign: "right",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  notFoundText: {
    color: "#6b7280",
    fontSize: 16,
  },
});
