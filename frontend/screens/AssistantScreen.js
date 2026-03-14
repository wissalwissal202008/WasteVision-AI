import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { getEcoAnswer } from "../data/ecoQA";
import i18n from "../i18n";

function createMessage(role, text) {
  return { id: Date.now() + Math.random(), role, text };
}

export default function AssistantScreen({ navigation }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(() => [
    createMessage("bot", t("coach.welcomeMessage")),
  ]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([createMessage("bot", t("coach.welcomeMessage"))]);
  }, [i18n.language]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed) return;

    setInputText("");
    const userMsg = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMsg]);

    const lang = i18n.language && ["fr", "en", "ar"].includes(i18n.language) ? i18n.language : "fr";
    const answer = getEcoAnswer(trimmed, lang) || t("coach.fallbackAnswer");
    const botMsg = createMessage("bot", answer);
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t("coach.title")}</Text>
        <Text style={styles.subtitle}>{t("coach.chatSubtitle")}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubbleWrap,
              msg.role === "user" ? styles.bubbleWrapUser : styles.bubbleWrapBot,
            ]}
          >
            {msg.role === "bot" && (
              <Text style={styles.botLabel}>{t("coach.title")}</Text>
            )}
            <View
              style={[
                styles.bubble,
                msg.role === "user" ? styles.bubbleUser : styles.bubbleBot,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === "user" ? styles.bubbleTextUser : styles.bubbleTextBot,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.suggestions}>
        {[1, 2, 3, 4].map((i) => (
          <TouchableOpacity
            key={i}
            style={styles.chip}
            onPress={() => sendMessage(t("coach.suggested" + i))}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{t("coach.suggested" + i)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t("coach.placeholder")}
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>{t("coach.send")}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.scanLink}
        onPress={() => navigation.navigate("Scan")}
      >
        <Text style={styles.scanLinkText}>📷 {t("coach.openScanner")}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  bubbleWrap: {
    marginBottom: spacing.md,
    maxWidth: "88%",
  },
  bubbleWrapUser: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleWrapBot: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  botLabel: {
    fontSize: fontSize.caption,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  bubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: "100%",
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  bubbleText: {
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  bubbleTextBot: {
    color: colors.text,
  },
  bubbleTextUser: {
    color: colors.textOnPrimary,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chip: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: fontSize.caption,
    color: colors.accentForeground,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    minHeight: 44,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
    fontSize: fontSize.body,
  },
  scanLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    backgroundColor: colors.muted,
  },
  scanLinkText: {
    fontSize: fontSize.small,
    color: colors.primary,
    fontWeight: "600",
  },
});
