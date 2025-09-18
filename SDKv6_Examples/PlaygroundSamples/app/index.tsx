import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link, Href } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NavigationItem {
  title: string;
  description: string;
  route: Href;
  color: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Mappedin Pro",
    description: "Load and display an interactive map with basic controls",
    route: "/basic",
    color: "#007AFF",
    icon: "🗺️",
  },
  {
    title: "Mappedin Enterprise",
    description: "Load and display an interactive map with basic controls",
    route: "/enterprise",
    color: "#34C759",
    icon: "🏭",
  },
  {
    title: "Interactivity",
    description: "Capture and act on click events",
    route: "/interactivity",
    color: "#AF52DE",
    icon: "🎯",
  },
  {
    title: "Markers",
    description: "Add interactive markers with HTML content and click handling",
    route: "/markers",
    color: "#FF6B6B",
    icon: "📍",
  },
  {
    title: "Labels",
    description:
      "Add labels with dynamic updates, click interactions, and zoom-based visibility",
    route: "/labels",
    color: "#FF9500",
    icon: "🏷️",
  },
  {
    title: "Directions",
    description:
      "Get directions between spaces and display the path with markers",
    route: "/directions",
    color: "#FF9500",
    icon: "🧭",
  },
  {
    title: "Directions Multi Destination",
    description:
      "Get directions between multiple spaces and display the path with markers",
    route: "/directions-multi-destination",
    color: "#FF9500",
    icon: "🧭",
  },
  {
    title: "Dynamic Focus",
    description:
      "Advanced indoor mapping with intelligent focus management and interactive controls",
    route: "/dynamic-focus",
    color: "#8E44AD",
    icon: "🎯",
  },
  {
    title: "Paths",
    description:
      "Display navigation paths between spaces with interactive controls",
    route: "/paths",
    color: "#5856D6",
    icon: "🛤️",
  },
  {
    title: "3D Models",
    description:
      "Place interactive 3D models on the map that can be selected and moved",
    route: "/models",
    color: "#FF2D92",
    icon: "🦆",
  },
  {
    title: "Custom Shapes",
    description:
      "Display custom 3D geometry on the map with various styling options and interactive controls",
    route: "/shapes",
    color: "#8E44AD",
    icon: "🔷",
  },
  {
    title: "BlueDot Multi-floor",
    description:
      "Navigate BlueDot through multiple floors with position updates",
    route: "/bluedot-multi-floor",
    color: "#5856D6",
    icon: "🔵",
  },
	{
		title: 'Offline Map',
		description: 'Load and display a map from a local MVF file bundled with the app, enabling offline functionality',
		route: '/offline',
		color: '#6B7280',
		icon: '💾',
	},  
  {
    title: "Location Categories",
    description:
      "Display location categories and profiles in a hierarchical grid layout",
    route: "/location-categories" as any,
    color: "#10B981",
    icon: "🏪",
  },
];

const SEARCH_QUERY_KEY = "@mappedin_search_query";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved search query on component mount
  useEffect(() => {
    loadSearchQuery();
  }, []);

  // Save search query whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveSearchQuery(searchQuery);
    }
  }, [searchQuery, isLoading]);

  const loadSearchQuery = async () => {
    try {
      const savedQuery = await AsyncStorage.getItem(SEARCH_QUERY_KEY);
      if (savedQuery !== null) {
        setSearchQuery(savedQuery);
      }
    } catch (error) {
      console.log("Error loading search query:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearchQuery = async (query: string) => {
    try {
      await AsyncStorage.setItem(SEARCH_QUERY_KEY, query);
    } catch (error) {
      console.log("Error saving search query:", error);
    }
  };

  const filteredNavigationItems = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNavigationItem = ({ item }: { item: NavigationItem }) => (
    <Link href={item.route} asChild>
      <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
        <View
          style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}
        >
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
        <View style={[styles.arrowContainer, { backgroundColor: item.color }]}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Mappedin SDK</Text>
          <Text style={styles.subtitle}>React Native Examples</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search examples..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={filteredNavigationItems}
            renderItem={renderNavigationItem}
            keyExtractor={(item) => item.route.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No examples found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            )}
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.instruction}>
            Select an example above to see the Mappedin SDK in action
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
    marginTop: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    fontWeight: "400",
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  instruction: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    maxWidth: 280,
  },
});
