/**
 * Local notifications – rappels et conseils recyclage.
 * Uses expo-notifications. In Expo Go (SDK 53+), push/notifications are disabled to avoid errors.
 */
import { Platform } from "react-native";

let Notifications = null;
try {
  const Constants = require("expo-constants").default;
  if (Constants.appOwnership !== "expo") {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
    });
  }
} catch (e) {}

const REMINDER_ID_PREFIX = "wastevision_reminder_";
const REMINDER_HOUR = 18;
const REMINDER_MINUTE = 0;

/** Request permission and return whether granted */
export async function requestNotificationPermission() {
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Get current app language for notification content */
function getNotificationLang() {
  try {
    const i18n = require("../i18n").default;
    const lng = i18n.language || "fr";
    return ["fr", "en", "ar"].includes(lng) ? lng : "fr";
  } catch {
    return "fr";
  }
}

/** Titles for reminder notifications by language */
const REMINDER_TITLES = {
  fr: "WasteVision – Rappel",
  en: "WasteVision – Reminder",
  ar: "WasteVision – تذكير",
};

/**
 * Schedule daily reminders with recycling tips.
 * One notification per weekday at 18:00 (local), each with a different tip.
 * Idempotent: cancels previous reminders before scheduling.
 */
export async function scheduleDailyReminder() {
  if (!Notifications) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const { getTipForWeekday } = require("../data/recyclingTips");
  const lang = getNotificationLang();
  const title = REMINDER_TITLES[lang] || REMINDER_TITLES.fr;

  for (let weekday = 1; weekday <= 7; weekday++) {
    const id = REMINDER_ID_PREFIX + weekday;
    await Notifications.cancelScheduledNotificationAsync(id);
    const body = getTipForWeekday(weekday, lang);
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
        channelId: Platform.OS === "android" ? "wastevision_reminders" : undefined,
      },
    });
  }
}

/** Cancel all daily reminder notifications (all weekdays). */
export async function cancelDailyReminder() {
  if (!Notifications) return;
  for (let weekday = 1; weekday <= 7; weekday++) {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID_PREFIX + weekday);
  }
}

/** Show an immediate local notification (e.g. level-up). */
export async function notifyNow(title, body) {
  if (!Notifications) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
    channelId: Platform.OS === "android" ? "wastevision_reminders" : undefined,
  });
}

/** Create Android channel (call once at app start). */
export async function setupNotificationChannel() {
  if (!Notifications || Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("wastevision_reminders", {
    name: "Rappels & conseils recyclage",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: true,
  });
}
