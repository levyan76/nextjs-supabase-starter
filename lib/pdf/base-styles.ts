import { StyleSheet } from "@react-pdf/renderer";

// ── Colors ──────────────────────────────────────────────
export const colors = {
  primary: "#1a1a2e",
  accent: "#e94560",
  textDark: "#1a1a2e",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  bgLight: "#f9fafb",
  white: "#ffffff",
} as const;

// ── Base Styles ─────────────────────────────────────────
export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: colors.textDark,
  },

  // ── Header ──────────────────────────────────────────
  headerContainer: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerCompanyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDocTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 2,
  },
  headerDocDate: {
    fontSize: 9,
    color: colors.textMuted,
  },
  headerDocNumber: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },

  // ── Footer ──────────────────────────────────────────
  footerContainer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerConfidentiality: {
    fontSize: 7,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  footerPageNumber: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // ── Typography ──────────────────────────────────────
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 6,
    marginTop: 14,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.textDark,
  },
  label: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.textMuted,
    marginBottom: 2,
  },

  // ── Table ───────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    color: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: colors.bgLight,
  },

  // ── Spacing helpers ─────────────────────────────────
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  row: { flexDirection: "row" },
  spaceBetween: { justifyContent: "space-between" },
});
