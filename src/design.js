// ─── Design Tokens ───────────────────────────────────────────────────────────
// Current theme: warm dark orange  (backup of original blue theme → design.BLUE-BACKUP.js)

export const C = {
  bg:          "#0b0a09",           // deep dark warm near-black
  surface:     "rgba(255,210,160,0.045)", // warm tint instead of neutral white
  surfaceHov:  "rgba(255,210,160,0.08)",
  border:      "rgba(255,190,120,0.1)",   // warm amber border
  gold:        "#fbc800",           // brighter, fully-saturated gold (was #e8b923)
  gold2:       "#d4a820",           // mid gold
  gold3:       "#a8862a",           // deep gold
  goldDim:     "rgba(251,200,0,0.15)",
  goldGlow:    "rgba(251,200,0,0.30)",   // slightly more glow to match brighter gold
  text:        "#f0ebe5",           // warm off-white (was cool #ededef)
  textMuted:   "#8a7a6c",           // warm muted brown-grey (was cool #7a7a8a)
  textDim:     "#5c4e42",           // warm dim (was cool #55556a)
  top1Bg:      "rgba(251,200,0,0.14)",
  top2Bg:      "rgba(251,200,0,0.08)",
  top3Bg:      "rgba(251,200,0,0.04)",
};

export const F = {
  display: "'Bebas Neue', sans-serif",
  body:    "'DM Sans', sans-serif",
};

// ─── Shared Style Objects ─────────────────────────────────────────────────────

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
