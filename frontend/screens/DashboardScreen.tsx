/**
 * Impact (Stats) – maquette : bandeau vert, CO₂, mini-cartes, impact env., succès, CTA.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  I18nManager,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Leaf,
  Flame,
  TreeDeciduous,
  Car,
  Medal,
  Target,
  Star,
  Trophy,
  Globe,
  Scan,
} from "lucide-react-native";

import { getHistory } from "../api/client";
import { KG_CO2_PER_SCAN } from "../services/ecoScore";
import { isRTLLocale } from "../src/i18n/translations";
import { createShadowStyle } from "../utils/shadowStyles";

type Nav = { navigate: (n: string, p?: Record<string, unknown>) => void };

const shadowDashCard = createShadowStyle({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
});
const shadowDashCta = createShadowStyle({
  shadowColor: "#10b981",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 8,
});


export type DashboardScreenProps = { navigation: Nav };

type HistoryItem = { created_at?: string };

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeDayStreak(items: HistoryItem[]): number {
  const days = new Set<string>();
  for (const it of items) {
    if (!it.created_at) continue;
    const d = new Date(it.created_at);
    if (!Number.isNaN(d.getTime())) days.add(dayKey(d));
  }
  if (days.size === 0) return 0;
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  for (;;) {
    if (days.has(dayKey(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  return streak;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = I18nManager.isRTL || isRTLLocale(i18n.language);
  const [scansCount, setScansCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getHistory();
          const list = Array.isArray(data) ? (data as HistoryItem[]) : [];
          const now = Date.now();
          const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
          const weekItems = list.filter((r) => {
            const ts = r.created_at ? new Date(r.created_at).getTime() : 0;
            return ts >= weekAgo;
          });
          if (!cancelled) {
            setHistoryList(list);
            setScansCount(list.length);
            setWeeklyCount(weekItems.length);
          }
        } catch {
          if (!cancelled) {
            setHistoryList([]);
            setScansCount(0);
            setWeeklyCount(0);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const co2Saved = Math.round(scansCount * KG_CO2_PER_SCAN * 10) / 10;
  const streakDays = computeDayStreak(historyList);
  const treesEquiv = (co2Saved / 21).toFixed(1);
  const kmEquiv = Math.max(0, Math.round(co2Saved * 8));

  const achievements: {
    id: string;
    titleKey: string;
    descKey: string;
    unlocked: boolean;
    Icon: typeof Target;
  }[] = [
    {
      id: "first",
      titleKey: "dashboard.achievementFirstTitle",
      descKey: "dashboard.achievementFirstDesc",
      unlocked: scansCount >= 1,
      Icon: Target,
    },
    {
      id: "eco25",
      titleKey: "dashboard.achievementEco25Title",
      descKey: "dashboard.achievementEco25Desc",
      unlocked: scansCount >= 25,
      Icon: Star,
    },
    {
      id: "streak",
      titleKey: "dashboard.achievementStreakTitle",
      descKey: "dashboard.achievementStreakDesc",
      unlocked: streakDays >= 7,
      Icon: Flame,
    },
    {
      id: "master",
      titleKey: "dashboard.achievementMasterTitle",
      descKey: "dashboard.achievementMasterDesc",
      unlocked: scansCount >= 100,
      Icon: Trophy,
    },
    {
      id: "co2",
      titleKey: "dashboard.achievementCo2HeroTitle",
      descKey: "dashboard.achievementCo2HeroDesc",
      unlocked: co2Saved >= 50,
      Icon: Globe,
    },
  ];

  const unlockedN = achievements.filter((a) => a.unlocked).length;
  const totalA = achievements.length;

  const topPad = Math.max(insets.top, 12);

  if (loading && scansCount === 0 && historyList.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f9fafb]">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-3 text-gray-500">{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f9fafb]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#10b981", "#047857", "#065f46"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          paddingTop: topPad,
          paddingHorizontal: 20,
          paddingBottom: 28,
        }}
      >
        <View
          className="mb-6 flex-row items-center justify-between"
          style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
        >
          <Pressable
            onPress={() => navigation.navigate("Accueil")}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <ArrowLeft
              color="#fff"
              size={22}
              style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-bold text-white">
            {t("dashboard.impactScreenTitle")}
          </Text>
          <View className="w-10" />
        </View>

        <View className="items-center">
          <View className="mb-3 rounded-3xl bg-white/15 px-6 py-4">
            <Leaf size={32} color="#fff" strokeWidth={2} />
          </View>
          <Text className="text-4xl font-bold text-white">{co2Saved.toFixed(1)}</Text>
          <Text className="mt-1 text-base font-medium text-white/90">
            {t("dashboard.co2SavedLabel")}
          </Text>
        </View>

        <View
          className="mt-6 flex-row gap-2"
          style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
        >
          {[
            { val: scansCount, label: t("dashboard.totalScansShort") },
            {
              val: streakDays,
              label: t("dashboard.dayStreak"),
              icon: "flame" as const,
            },
            { val: weeklyCount, label: t("dashboard.thisWeek") },
          ].map((cell, i) => (
            <View
              key={i}
              className="flex-1 rounded-xl bg-black/20 px-2 py-3"
            >
              <View className="flex-row items-center justify-center gap-1">
                {cell.icon === "flame" ? (
                  <Flame size={16} color="#fb923c" />
                ) : null}
                <Text className="text-center text-xl font-bold text-white">
                  {cell.val}
                </Text>
              </View>
              <Text
                className="mt-1 text-center text-[11px] font-medium text-white/85"
                numberOfLines={2}
              >
                {cell.label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View className="px-5 pt-6">
        <View
          className="mb-5 rounded-3xl bg-white p-5"
          style={shadowDashCard}
        >
          <View className="mb-4 flex-row items-center gap-2">
            <Leaf size={22} color="#059669" strokeWidth={2} />
            <Text className="text-lg font-bold text-gray-900">
              {t("dashboard.envImpactSection")}
            </Text>
          </View>
          <View
            className="mb-4 flex-row items-center gap-3"
            style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <TreeDeciduous size={24} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">{t("dashboard.equivTo")}</Text>
              <Text className="text-base font-bold text-gray-900">
                {t("dashboard.treesPlanted", { count: treesEquiv })}
              </Text>
            </View>
          </View>
          <View
            className="mb-4 flex-row items-center gap-3"
            style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-sky-100">
              <Car size={24} color="#dc2626" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">{t("dashboard.kmNotDriven")}</Text>
              <Text className="text-base font-bold text-gray-900">
                {t("dashboard.kmValue", { count: kmEquiv })}
              </Text>
            </View>
          </View>
          <View className="rounded-2xl bg-emerald-50 px-4 py-3">
            <Text className="text-center text-sm leading-5 text-emerald-900">
              🎉 {t("dashboard.impactEncouragement")}
            </Text>
          </View>
        </View>

        <View
          className="mb-5 rounded-3xl bg-white p-5"
          style={shadowDashCard}
        >
          <View
            className="mb-4 flex-row items-center justify-between"
            style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            <View className="flex-row items-center gap-2">
              <Medal size={22} color="#ea580c" />
              <Text className="text-lg font-bold text-gray-900">
                {t("dashboard.achievementsTitle").replace(/^🏆\s*/, "")}
              </Text>
            </View>
            <Text className="text-sm text-gray-400">
              {t("dashboard.achievementCount", {
                current: unlockedN,
                total: totalA,
              })}
            </Text>
          </View>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {achievements.slice(0, 4).map((ach) => {
              const IconC = ach.Icon;
              return (
                <View
                  key={ach.id}
                  className={`mb-1 w-[48%] rounded-2xl border border-gray-100 p-3 ${
                    ach.unlocked ? "bg-amber-50/80" : "bg-gray-50"
                  }`}
                >
                  <View className="mb-2 items-center">
                    <IconC
                      size={28}
                      color={ach.unlocked ? "#059669" : "#9ca3af"}
                      strokeWidth={2}
                    />
                  </View>
                  <Text className="text-center text-sm font-bold text-gray-900">
                    {t(ach.titleKey)}
                  </Text>
                  <Text className="mt-1 text-center text-xs text-gray-500">
                    {t(ach.descKey)}
                  </Text>
                </View>
              );
            })}
          </View>
          {(() => {
            const last = achievements[4];
            if (!last) return null;
            const LastIcon = last.Icon;
            return (
              <View
                className={`mt-2 rounded-2xl border border-gray-100 p-4 ${
                  last.unlocked ? "bg-sky-50/80" : "bg-gray-50"
                }`}
              >
                <View className="items-center">
                  <LastIcon
                    size={30}
                    color={last.unlocked ? "#2563eb" : "#9ca3af"}
                  />
                </View>
                <Text className="mt-2 text-center text-sm font-bold text-gray-900">
                  {t(last.titleKey)}
                </Text>
                <Text className="mt-1 text-center text-xs text-gray-500">
                  {t(last.descKey)}
                </Text>
              </View>
            );
          })()}
        </View>

        {scansCount === 0 ? (
          <View className="items-center pb-8 pt-2">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Scan size={40} color="#059669" />
            </View>
            <Text className="mb-2 text-center text-xl font-bold text-gray-900">
              {t("dashboard.startJourneyTitle")}
            </Text>
            <Text className="mb-6 px-4 text-center text-base text-gray-500">
              {t("dashboard.startJourneySub")}
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Scan")}
              className="rounded-full bg-emerald-500 px-10 py-4 active:opacity-90"
              style={shadowDashCta}
            >
              <Text className="font-bold text-white">{t("home.startScanning")}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
