import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { FLAGS } from "@/constants/flags";

function TabIcon({ icon, color }: { icon: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Directory",
          tabBarIcon: ({ color }) => <TabIcon icon="≣" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerShown: false,
          // Hide the tab button (route stays registered) while the warm map is
          // kept loaded upfront for instant detail-page reparenting.
          href: FLAGS.HIDE_MAP_TAB ? null : undefined,
          tabBarIcon: ({ color }) => <TabIcon icon="◉" color={color} />,
        }}
      />
    </Tabs>
  );
}
