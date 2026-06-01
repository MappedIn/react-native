import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  EnterpriseCategory,
  EnterpriseLocation,
} from "@mappedin/mappedin-js";
import { useMapData } from "@/context/MapDataContext";
import { fetchCategoryIconSvg } from "@/utils/mapLabels";
import { LocationLogo } from "@/components/LocationLogo";

function getLogoUri(location: EnterpriseLocation): string | undefined {
  return location.logo ?? location.picture ?? undefined;
}

const CategoryIcon = ({
  category,
  size,
  fallback,
}: {
  category: EnterpriseCategory;
  size: number;
  fallback: string;
}) => {
  const [svg, setSvg] = useState<string | null>(null);
  const color = category.color ?? "#6b7280";

  useEffect(() => {
    let cancelled = false;
    fetchCategoryIconSvg(category, color).then((markup) => {
      if (!cancelled && markup) {
        setSvg(markup);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [category, color]);

  if (svg) {
    return <SvgXml xml={svg} width={size} height={size} />;
  }
  return <Text style={styles.logoFallback}>{fallback}</Text>;
};

const LocationRow = ({
  location,
  onPress,
}: {
  location: EnterpriseLocation;
  onPress: (location: EnterpriseLocation) => void;
}) => {
  const logoUri = getLogoUri(location);
  const category = location.categories[0];
  const categoryName = category?.name;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(location)}
    >
      <View style={styles.logoContainer}>
        {logoUri ? (
          <LocationLogo uri={logoUri} size={52} />
        ) : category ? (
          <CategoryIcon
            category={category}
            size={28}
            fallback={location.name.charAt(0).toUpperCase()}
          />
        ) : (
          <Text style={styles.logoFallback}>
            {location.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={1}>
          {location.name}
        </Text>
        {categoryName ? (
          <Text style={styles.category} numberOfLines={1}>
            {categoryName}
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
};

export default function DirectoryScreen() {
  const { locations } = useMapData();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return locations;
    }
    return locations.filter((location) =>
      location.name.toLowerCase().includes(trimmed)
    );
  }, [locations, query]);

  const handlePress = useCallback(
    (location: EnterpriseLocation) => {
      // The map is parked off-screen here, so no freeze-frame is needed; the
      // detail caches its own canonical frame once it appears.
      router.push(`/location/${location.id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: EnterpriseLocation }) => (
      <LocationRow location={item} onPress={handlePress} />
    ),
    [handlePress]
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.search}
          placeholder="Search stores"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No stores match “{query}”.</Text>
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  search: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  rowPressed: {
    backgroundColor: "#f3f4f6",
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoFallback: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6b7280",
  },
  rowText: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  category: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: "#d1d5db",
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
    marginLeft: 82,
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 15,
  },
});
