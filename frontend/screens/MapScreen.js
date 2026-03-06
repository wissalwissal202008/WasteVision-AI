/**
 * Recycling map: device location + nearby recycling points with distance.
 * Uses expo-location and react-native-maps. Mock points for demo; replace with
 * Google Maps API / Places or open data for production.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { colors, spacing, fontSize } from "../constants/theme";

// Mock recycling points (replace with API: Google Places, open data, etc.)
const MOCK_POINTS = [
  { id: "1", name: "Recycling center – North", type: "center", lat: 48.86, lng: 2.35 },
  { id: "2", name: "Glass bins – Main St", type: "bins", lat: 48.855, lng: 2.348 },
  { id: "3", name: "Plastic & paper – Square", type: "bins", lat: 48.857, lng: 2.355 },
  { id: "4", name: "Dechetterie South", type: "center", lat: 48.845, lng: 2.36 },
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [pointsWithDistance, setPointsWithDistance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (mounted) setError("Location permission denied.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (mounted) setLocation(loc.coords);
      } catch (e) {
        if (mounted) setError(e?.message || "Could not get location.");
        if (mounted) setLocation({ latitude: 48.8566, longitude: 2.3522 }); // Paris fallback
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const center = location || { latitude: 48.8566, longitude: 2.3522 };
    const withDist = MOCK_POINTS.map((p) => ({
      ...p,
      distance: haversineDistance(center.latitude, center.longitude, p.lat, p.lng),
    })).sort((a, b) => a.distance - b.distance);
    setPointsWithDistance(withDist);
  }, [location]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.helperText}>Getting location…</Text>
      </View>
    );
  }

  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  let MapComponent = null;
  if (Platform.OS !== "web") {
    try {
      MapComponent = require("react-native-maps").default;
    } catch (e) {}
  }

  return (
    <View style={styles.container}>
      {MapComponent ? (
        <View style={styles.mapWrap}>
          <MapComponent style={styles.map} region={region} showsUserLocation showsMyLocationButton>
            {location && <MapComponent.Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="You" />}
            {pointsWithDistance.map((p) => (
              <MapComponent.Marker
                key={p.id}
                coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={p.name}
                description={`${p.distance.toFixed(1)} km · ${p.type}`}
              />
            ))}
          </MapComponent>
        </View>
      ) : (
        <View style={styles.placeholderMap}>
          <Text style={styles.placeholderEmoji}>🗺️</Text>
          <Text style={styles.placeholderTitle}>Map (native only)</Text>
          <Text style={styles.placeholderText}>On device, the map shows your location and recycling points.</Text>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <Text style={styles.listTitle}>Nearby recycling points</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {pointsWithDistance.map((p) => (
          <View key={p.id} style={styles.listItem}>
            <Text style={styles.listItemName}>{p.name}</Text>
            <Text style={styles.listItemMeta}>
              {p.distance.toFixed(1)} km · {p.type}
            </Text>
          </View>
        ))}
        <Text style={styles.listHint}>Replace mock data with Google Maps API or open data for real points.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapWrap: { height: 280 },
  map: { width: "100%", height: "100%" },
  placeholderMap: {
    height: 200,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: { fontSize: 48, marginBottom: spacing.sm },
  placeholderTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text },
  placeholderText: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: 4 },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  listTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItemName: { fontSize: fontSize.body, fontWeight: "600", color: colors.text },
  listItemMeta: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
  listHint: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.lg },
  errorText: { fontSize: fontSize.small, color: colors.error, marginBottom: spacing.sm },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  helperText: { marginTop: spacing.md, color: colors.textSecondary },
});
