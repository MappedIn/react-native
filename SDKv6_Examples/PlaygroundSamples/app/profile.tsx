import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.description}>
        Welcome to your profile page! Here you can manage your account settings and preferences.
      </Text>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>User Information</Text>
        <Text style={styles.cardText}>Name: John Doe</Text>
        <Text style={styles.cardText}>Email: john.doe@example.com</Text>
        <Text style={styles.cardText}>Role: Developer</Text>
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
    backgroundColor: "#e8f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#34495e",
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    maxWidth: 300,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2c3e50",
  },
  cardText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 6,
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
  },
});
