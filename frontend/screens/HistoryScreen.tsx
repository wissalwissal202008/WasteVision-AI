/**
 * Historique des scans – maquette (en-tête mint, recherche pill, chips horizontales, liste / vide).
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  TextInput,
  Pressable,
  ScrollView,
  I18nManager,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Folder,
  Recycle,
  FileText,
  GlassWater,
  Package,
  Leaf,
  Trash2,
} from "lucide-react-native";

import { ErrorState, NoInternetState } from "../components";
import { getHistory, getUploadUrl } from "../api/client";
import { ECO_POINTS_BY_CATEGORY, ECO_POINTS_CORRECTION } from "../services/ecoScore";
import { isRTLLocale } from "../src/i18n/translations";
import { createShadowStyle } from "../utils/shadowStyles";

const CATEGORY_KEYS_LIST = [
  "plastic",
  "paper_cardboard",
  "glass",
  "metal",
  "organic",
  "non_recyclable",
] as const;

type CategoryKey = (typeof CATEGORY_KEYS_LIST)[number];

type HistoryRow = {
  id: number | string;
  created_at?: string;
  predicted_category?: string;
  corrected_category?: string;
  product_type?: string;
  object_name?: string;
  image_name?: string;
  recommended_bin?: string;
};

function formatDate(iso: string | undefined, locale: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const loc =
    locale === "ar" ? "ar-EG" : locale === "en" ? "en-GB" : "fr-FR";
  return d.toLocaleDateString(loc, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPointsForItem(item: HistoryRow) {
  const cat = item.corrected_category || item.predicted_category;
  const base = ECO_POINTS_BY_CATEGORY[cat as CategoryKey] ?? 5;
  const correctionBonus = item.corrected_category ? ECO_POINTS_CORRECTION : 0;
  return base + correctionBonus;
}

const CHIP_ICONS: Record<string, React.ReactNode> = {
  all: <Folder size={16} color="#ca8a04" strokeWidth={2.2} />,
  plastic: <Recycle size={16} color="#059669" strokeWidth={2.2} />,
  paper_cardboard: <FileText size={16} color="#9333ea" strokeWidth={2.2} />,
  glass: <GlassWater size={16} color="#b45309" strokeWidth={2.2} />,
  metal: <Package size={16} color="#64748b" strokeWidth={2.2} />,
  organic: <Leaf size={16} color="#16a34a" strokeWidth={2.2} />,
  non_recyclable: <Trash2 size={16} color="#6b7280" strokeWidth={2.2} />,
};

const shadowHistoryRow = createShadowStyle({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
});
const shadowHistoryBack = createShadowStyle({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
});
const shadowHistorySearch = createShadowStyle({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
});
const shadowHistoryCta = createShadowStyle({
  shadowColor: "#10b981",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 8,
});
type Nav = { navigate: (n: string, p?: Record<string, unknown>) => void };

export type HistoryScreenProps = { navigation: Nav };

function HistoryItem({
  item,
  locale,
  pointsLabel,
}: {
  item: HistoryRow;
  locale: string;
  pointsLabel: string;
}) {
  const [imgError, setImgError] = useState(false);
  const productLabel =
    item.product_type || item.object_name || item.predicted_category || "";
  const photoUrl = item.image_name ? getUploadUrl(item.image_name) : null;
  const showThumb = photoUrl && !imgError;
  const points = getPointsForItem(item);
  const dateStr = formatDate(item.created_at, locale);

  return (
    <View
      className="mb-3 rounded-2xl border border-black/[0.06] bg-white p-4"
      style={shadowHistoryRow}
    >
      <View className="flex-row items-start">
        {showThumb ? (
          <Image
            source={{ uri: photoUrl }}
            className="mr-3 h-14 w-14 rounded-xl bg-gray-200"
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
            <Recycle size={24} color="#059669" />
          </View>
        )}
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-[#064e3b]" numberOfLines={2}>
            {productLabel}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-emerald-600">
            {pointsLabel.replace("{{points}}", String(points))}
          </Text>
          <Text className="mt-1 text-xs text-gray-500">{dateStr}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = I18nManager.isRTL || isRTLLocale(i18n.language);
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const locale = i18n.language || "fr";

  const CATEGORY_LABELS: Record<string, string> = {
    plastic: t("history.categories.plastic"),
    paper_cardboard: t("history.categories.paper_cardboard"),
    glass: t("history.categories.glass"),
    metal: t("history.categories.metal"),
    organic: t("history.categories.organic"),
    non_recyclable: t("history.categories.non_recyclable"),
  };

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(Array.isArray(data) ? (data as HistoryRow[]) : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => void load(), [load]));

  const CATEGORY_KEYS = ["all", ...CATEGORY_KEYS_LIST] as const;

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterCategory !== "all") {
      list = list.filter(
        (i) =>
          (i.corrected_category || i.predicted_category) === filterCategory
      );
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

  const isNetworkError =
    error != null && /\b(network|fetch|connexion)\b/i.test(error);

  const headerPadTop = Math.max(insets.top, 12);

  const emptyMain = items.length === 0 && !error;
  const emptyFilter = items.length > 0 && filteredItems.length === 0;

  return (
    <View className="flex-1 bg-white">
      <View
        className="rounded-b-3xl bg-emerald-100 px-5 pb-5"
        style={{ paddingTop: headerPadTop }}
      >
        <View
          className="mb-4 flex-row items-center justify-between"
          style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
        >
          <Pressable
            onPress={() => navigation.navigate("Accueil")}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            style={shadowHistoryBack}
          >
            <ArrowLeft
              size={22}
              color="#064e3b"
              style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-bold text-emerald-900">
            {t("history.scanHistoryTitle")}
          </Text>
          <View className="w-10" />
        </View>

        {!error && items.length > 0 ? (
          <View
            className="flex-row items-center rounded-full bg-white px-4 py-3"
            style={shadowHistorySearch}
          >
            <Search size={20} color="#6ee7b7" strokeWidth={2} />
            <TextInput
              className="ml-3 flex-1 py-0 text-base text-gray-800"
              placeholder={t("history.searchScansPlaceholder")}
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
          </View>
        ) : null}
      </View>

      {!error && items.length > 0 ? (
        <View className="border-b border-gray-100 bg-white py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 10,
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            {CATEGORY_KEYS.map((key) => {
              const active = filterCategory === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setFilterCategory(key)}
                  className={`flex-row items-center gap-2 rounded-xl px-4 py-2.5 ${
                    active ? "bg-emerald-500" : "border border-gray-200 bg-white"
                  }`}
                >
                  <View
                    style={{
                      opacity: active ? 1 : 0.85,
                    }}
                  >
                    {CHIP_ICONS[key] ?? CHIP_ICONS.all}
                  </View>
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {key === "all" ? t("history.all") : CATEGORY_LABELS[key] || key}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {error ? (
        <View className="flex-1 px-5 pt-6">
          {isNetworkError ? (
            <NoInternetState onRetry={load} />
          ) : (
            <ErrorState
              title={t("common.error")}
              message={error}
              onRetry={load}
            />
          )}
        </View>
      ) : loading && items.length === 0 ? (
        <Text className="mt-10 text-center text-gray-500">{t("common.loading")}</Text>
      ) : emptyMain ? (
        <View className="flex-1 items-center justify-center px-8 pb-24">
          <View className="mb-6 h-36 w-36 items-center justify-center rounded-full bg-gray-100">
            <Trash2 size={56} color="#9ca3af" strokeWidth={1.8} />
          </View>
          <Text className="mb-2 text-center text-xl font-bold text-gray-800">
            {t("history.noScansFound")}
          </Text>
          <Text className="mb-8 text-center text-base leading-6 text-gray-500">
            {t("history.emptyBuildHistory")}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Scan")}
            className="rounded-full bg-emerald-500 px-10 py-4 active:opacity-90"
            style={shadowHistoryCta}
          >
            <Text className="text-center text-base font-bold text-white">
              {t("home.startScanning")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <HistoryItem
              item={item}
              locale={locale}
              pointsLabel={t("history.pointsFormat")}
            />
          )}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 100,
          }}
          ListEmptyComponent={
            emptyFilter ? (
              <View className="items-center py-12">
                <Text className="mb-2 text-center text-lg font-semibold text-gray-800">
                  {t("history.noResultsTitle")}
                </Text>
                <Text className="mb-6 text-center text-gray-500">
                  {t("history.noResultsMessage")}
                </Text>
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                    setFilterCategory("all");
                  }}
                  className="rounded-full bg-emerald-100 px-6 py-3"
                >
                  <Text className="font-semibold text-emerald-800">
                    {t("history.resetAction")}
                  </Text>
                </Pressable>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} tintColor="#10b981" />
          }
        />
      )}
    </View>
  );
}
