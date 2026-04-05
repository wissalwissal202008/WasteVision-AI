/**
 * Graphiques d'impact : camembert (répartition déchets) + barres (CO₂/jour).
 * Données GET /stats ; fallback mock si l'API échoue.
 * (Demande initiale en .tsx ; le projet Expo est en .js.)
 */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { getStats } from "../../api/client";
import { spacing } from "../../constants/theme";
import { useTranslation } from "react-i18next";

/** ScrollView dashboard uses paddingHorizontal: spacing.lg; extra margin avoids chart-kit overflow */
const HORIZONTAL_GUTTER = spacing.lg * 2 + 16;
const CHART_HEIGHT = 220;

const ECO_COLORS = {
  plastic: "#10b981",
  paper: "#eab308",
  glass: "#0ea5e9",
  metal: "#14b8a6",
  organic: "#84cc16",
  other: "#94a3b8",
};

const CATEGORY_KEYS = [
  { key: "plastic", color: ECO_COLORS.plastic },
  { key: "paper_cardboard", color: ECO_COLORS.paper },
  { key: "glass", color: ECO_COLORS.glass },
  { key: "metal", color: ECO_COLORS.metal },
  { key: "organic", color: ECO_COLORS.organic },
];

const MOCK_COUNTS = {
  plastic: 12,
  paper_cardboard: 8,
  glass: 6,
  metal: 4,
  organic: 5,
  non_recyclable: 2,
};

function mockCo2ByDay() {
  const out = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const day = d.toISOString().slice(0, 10);
    out.push({ day, grams: [0, 40, 15, 60, 0, 100, 55][6 - i] || 20 });
  }
  return out;
}

const MOCK_CO2_BY_DAY = mockCo2ByDay();

function shortDayLabel(iso) {
  const d = new Date(`${iso}T12:00:00.000Z`);
  const names = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return names[d.getUTCDay()] ?? iso.slice(5);
}

function buildChartConfig(width) {
  return {
    backgroundColor: "#ecfdf5",
    backgroundGradientFrom: "#d1fae5",
    backgroundGradientTo: "#a7f3d0",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#059669" },
    barPercentage: 0.65,
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "rgba(16, 185, 129, 0.2)",
    },
    propsForLabels: { fontSize: width < 360 ? 10 : 11 },
  };
}

export default function WasteChart() {
  const { t } = useTranslation();
  const [screenWidth, setScreenWidth] = useState(
    () => Dimensions.get("window").width
  );

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => sub?.remove?.();
  }, []);

  const chartWidth = Math.max(screenWidth - HORIZONTAL_GUTTER, 200);

  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [counts, setCounts] = useState(MOCK_COUNTS);
  const [co2ByDay, setCo2ByDay] = useState(MOCK_CO2_BY_DAY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStats();
      const c = data?.counts_by_category;
      if (c && typeof c === "object") {
        setCounts({
          plastic: Number(c.plastic) || 0,
          paper_cardboard: Number(c.paper_cardboard) || 0,
          glass: Number(c.glass) || 0,
          metal: Number(c.metal) || 0,
          organic: Number(c.organic) || 0,
          non_recyclable: Number(c.non_recyclable) || 0,
        });
      }
      const series = Array.isArray(data?.co2_by_day) ? data.co2_by_day : [];
      if (series.length > 0) {
        setCo2ByDay(
          series.map((p) => ({
            day: String(p.day),
            grams: Number(p.grams) || 0,
          }))
        );
      } else {
        setCo2ByDay(MOCK_CO2_BY_DAY);
      }
      setUsingMock(false);
    } catch {
      setCounts(MOCK_COUNTS);
      setCo2ByDay(MOCK_CO2_BY_DAY);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const categoryLabel = useCallback(
    (key) => {
      if (key === "plastic") return t("dict.plastic");
      if (key === "paper_cardboard") return t("dict.paper");
      if (key === "glass") return t("dict.glass");
      if (key === "metal") return t("history.categories.metal");
      if (key === "organic") return t("history.categories.organic");
      return key;
    },
    [t]
  );

  const pieData = useMemo(() => {
    const rows = CATEGORY_KEYS.map(({ key, color }) => ({
      name: categoryLabel(key),
      population: Math.max(0, Number(counts[key]) || 0),
      color,
      legendFontColor: "#334155",
      legendFontSize: 11,
    }));
    const other = Number(counts.non_recyclable) || 0;
    if (other > 0) {
      rows.push({
        name: t("dict.other"),
        population: other,
        color: ECO_COLORS.other,
        legendFontColor: "#334155",
        legendFontSize: 11,
      });
    }
    const total = rows.reduce((s, r) => s + r.population, 0);
    if (total === 0) {
      return [
        {
          name: "—",
          population: 1,
          color: "#cbd5e1",
          legendFontColor: "#64748b",
          legendFontSize: 11,
        },
      ];
    }
    return rows.filter((r) => r.population > 0);
  }, [counts, categoryLabel, t]);

  const barData = useMemo(() => {
    const points = co2ByDay.length >= 7 ? co2ByDay.slice(-7) : co2ByDay;
    const labels = points.map((p) => shortDayLabel(p.day));
    const values = points.map((p) => Math.max(0, Math.round(Number(p.grams) || 0)));
    return {
      labels,
      datasets: [{ data: values.length ? values : [0, 0, 0, 0, 0, 0, 0] }],
    };
  }, [co2ByDay]);

  const chartConfig = useMemo(() => buildChartConfig(chartWidth), [chartWidth]);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#059669" />
        <Text style={styles.loadingText}>{t("dashboard.chartsLoading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {usingMock ? (
        <Text style={styles.mockBadge}>{t("dashboard.chartsDemoMode")}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>{t("dashboard.wasteChartDistribution")}</Text>
      <PieChart
        data={pieData}
        width={chartWidth}
        height={CHART_HEIGHT}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="8"
        absolute={false}
        hasLegend
      />

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>{t("dashboard.wasteChartCo2Day")}</Text>
      <BarChart
        data={barData}
        width={chartWidth}
        height={CHART_HEIGHT}
        yAxisSuffix=" g"
        yAxisLabel=""
        chartConfig={chartConfig}
        verticalLabelRotation={screenWidth < 380 ? 45 : 0}
        fromZero
        showValuesOnTopOfBars
        style={styles.barChart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
    alignItems: "center",
  },
  loadingBox: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 14,
  },
  mockBadge: {
    alignSelf: "center",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    alignSelf: "flex-start",
    width: "100%",
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
  },
  sectionTitleSpaced: {
    marginTop: 16,
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
