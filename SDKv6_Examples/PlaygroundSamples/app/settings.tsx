import { Text, View, StyleSheet, Switch } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <Text style={styles.description}>
        Customize your app experience with these settings.
      </Text>

      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={darkModeEnabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Back to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#495057",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#6c757d",
    lineHeight: 24,
  },
  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 350,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  settingLabel: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "500",
  },
  versionText: {
    fontSize: 14,
    color: "#6c757d",
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
});
