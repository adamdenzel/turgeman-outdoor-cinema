// ─── BACKUP — Original blue/cool theme ───────────────────────────────────────
// To restore: copy contents of this file back into design.js

export const C = {
  bg:          "#0b0b18",
  surface:     "rgba(255,255,255,0.035)",
  surfaceHov:  "rgba(255,255,255,0.065)",
  border:      "rgba(255,255,255,0.08)",
  gold:        "#e8b923",
  gold2:       "#c9a732",
  gold3:       "#a08e40",
  goldDim:     "rgba(232,185,35,0.15)",
  goldGlow:    "rgba(232,185,35,0.25)",
  text:        "#ededef",
  textMuted:   "#7a7a8a",
  textDim:     "#55556a",
  top1Bg:      "rgba(232,185,35,0.14)",
  top2Bg:      "rgba(232,185,35,0.08)",
  top3Bg:      "rgba(232,185,35,0.04)",
};

export const F = {
  display: "'Bebas Neue', sans-serif",
  body:    "'DM Sans', sans-serif",
};

export const inp = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: F.body,
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text,
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
  WebkitAppearance: "none",
};

export const btnPrimary = {
  padding: "14px 40px",
  fontFamily: F.display,
  fontSize: 22,
  letterSpacing: "0.06em",
  background: C.gold,
  border: "none",
  borderRadius: 10,
  color: C.bg,
  cursor: "pointer",
  display: "inline-block",
};

export const btnGhost = {
  padding: "10px 22px",
  fontFamily: F.body,
  fontSize: 13,
  fontWeight: 600,
  background: "transparent",
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.textMuted,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
