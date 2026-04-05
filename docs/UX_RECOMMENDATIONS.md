# UI/UX recommendations — WasteVision AI

Small, **non-breaking** improvements for a more polished production feel. Pick items by priority; several can be done without API changes.

---

## 1. Loading indicators

- **Predict / classify:** keep or add a **full-width subtle progress** on the result route while waiting (spinner + short line: "Analyse en cours…").
- **Live scan:** the scan-line animation is good; add **haptic feedback** (optional) on first successful detection for delight.
- **History / stats:** **skeleton placeholders** or pull-to-refresh instead of blank screen on slow networks.

## 2. Error handling and uncertain predictions

- **Low confidence:** if `confidence < 0.5` (tune threshold), show a **banner**: "Résultat incertain — vérifiez localement" + CTA to **retake photo**.
- **Network errors:** distinguish **timeout** vs **unreachable** vs **HTTP 5xx** with different short messages and a **Retry** button.
- **422 / bad image:** friendly message ("Image illisible, essayez une autre photo") instead of raw API text.

## 3. Feedback messages

- **Success:** brief **toast** or inline checkmark when a scan is saved to history.
- **Correction submitted:** thank-you state ("Merci, cela améliore le modèle").
- **Empty history:** single **primary CTA** "Faire mon premier scan" linking to Scan tab.

## 4. Consistency

- Use the same **corner radius** and **primary color** for all primary buttons (already partly centralized in theme).
- Align **terminology**: "Déchet" / "Scan" / "Historique" vs English strings when mixing — prefer full locale switch.

## 5. Accessibility

- Ensure **touch targets** ≥ 44pt; **contrast** for text on colored category chips.
- **Screen reader** labels on icon-only tab items (`accessibilityLabel`).

---

For system architecture, see [ARCHITECTURE.md](../ARCHITECTURE.md). For release gates, see [RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md).

