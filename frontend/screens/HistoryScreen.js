import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card, EmptyState, ErrorState, NoInternetState } from "../components";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { getHistory, getUploadUrl } from "../api/client";

const CATEGORY_LABELS = {
  plastic: "Plastique",
  paper_cardboard: "Papier / Carton",
  glass: "Verre",
  metal: "M?tal",
  organic: "Organique",
  non_recyclable: "Non recyclable",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryItem({ item }) {
  const [imgError, setImgError] = useState(false);
  const label = CATEGORY_LABELS[item.predicted_category] || item.predicted_category;
  const productLabel = item.product_type || item.object_name || label;
  const photoUrl = item.image_name ? getUploadUrl(item.image_name) : null;
  const showThumb = photoUrl && !imgError;
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        {showThumb ? (
          <Image
            source={{ uri: photoUrl }}
            style={styles.itemThumb}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
            <Text style={styles.itemThumbPlaceholderText}>??</Text>
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={styles.itemScanned}>Produit : {productLabel}</Text>
          <Text style={styles.itemCategory}>{label}</Text>
          <Text style={styles.itemBin}>{item.recommended_bin}</Text>
          <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Impossible de charger l'historique");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const CATEGORY_KEYS = ["all", ...Object.keys(CATEGORY_LABELS)];
  const filteredItems = useMemo(() => {
    let list = items;
    if (filterCategory !== "all") {
      list = list.filter((i) => (i.predicted_category || i.corrected_category) === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.object_name || "").toLowerCase().includes(q) ||
          (i.product_type || "").toLowerCase().includes(q) ||
          (i.recommended_bin || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, filterCategory, searchQuery]);
  const isNetworkError = error && (/\b(network|fetch|connexion)\b/i.test(error));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>Vos derniers scans</Text>
      </View>

      {!error && items.length > 0 && (
        <>
          <TextInput style={styles.search} placeholder="Rechercher (produit, bac?)" placeholderTextColor={colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} />
          <View style={styles.filterRow}>
            {CATEGORY_KEYS.map((key) => (
              <TouchableOpacity key={key} style={[styles.filterChip, filterCategory === key && styles.filterChipActive]} onPress={() => setFilterCategory(key)}>
                <Text style={[styles.filterChipText, filterCategory === key && styles.filterChipTextActive]}>{key === "all" ? "Tous" : CATEGORY_LABELS[key] || key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      {error && (
        <View style={styles.stateWrap}>
          {isNetworkError ? <NoInternetState onRetry={load} /> : <ErrorState title="Erreur" message={error} onRetry={load} />}
        </View>
      )}

      {loading && items.length === 0 ? (
        <Text style={styles.empty}>Chargement?</Text>
      ) : items.length === 0 ? (
        <View style={styles.stateWrap}>
          <EmptyState
            icon="??"
            title="Aucun scan"
            message="Scannez un d?chet pour commencer. Vos scans s'afficheront ici."
            actionLabel="Faire un scan"
            onAction={() => navigation?.navigate("Scan")}
          />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <HistoryItem item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.stateWrap}>
              <EmptyState
                icon="??"
                title="Aucun r?sultat"
                message="Aucun scan ne correspond ? la recherche ou au filtre."
                actionLabel="R?initialiser"
                onAction={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                }}
              />
            </View>
          }
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[colors.primary]} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  error: {
    fontSize: fontSize.small,
    color: colors.error,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full / 2,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
    marginTop: 6,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: colors.border,
  },
  itemThumbPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemThumbPlaceholderText: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemScanned: {
    fontSize: fontSize.subhead,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemCategory: {
    fontSize: fontSize.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  itemBin: {
    fontSize: fontSize.small,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  itemDate: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  empty: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
    fontWeight: "600",
  },
  stateWrap: {
    flex: 1,
    padding: spacing.lg,
  },
});
