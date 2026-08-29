import React from "react";

/**
 * Animated visual for the Product page hero's right-hand column.
 * Self-contained: colors match the TaxSaarthi dark theme tokens
 * (T.accent, T.cyan, T.amber, etc.) but are inlined here so this
 * file has no dependency on the main App file. If you'd rather
 * share one source of truth, delete the THEME object below and
 * import { T } from your main file instead (just add `export`
 * in front of `const T = {...}` there).
 */
const THEME = {
  surface: "#0A1428",
  surface2: "#0F1C38",
  border: "#1B2945",
  borderStrong: "#2C4270",
  textPrimary: "#EEF2FA",
  textSecondary: "#8C9AB8",
  textFaint: "#5D6B8A",
  accent: "#4C7FFF",
  accentSoft: "#1A2D5C",
  cyan: "#38E0E0",
  amber: "#E8B34C",
};

const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const sans = { fontFamily: "'Inter', sans-serif" };
const fmtINR = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");

export default function ProductHeroVisual() {
  const T = THEME;
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460, margin: "0 auto" }}>
      <style>{`
        @keyframes tsph-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes tsph-pulse { 0%,100% { opacity:.5; transform: scale(1); } 50% { opacity:1; transform: scale(1.15); } }
        @keyframes tsph-flow { to { stroke-dashoffset: -24; } }
        @keyframes tsph-glow { 0%,100% { opacity:.35; } 50% { opacity:.7; } }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.accentSoft} 0%, transparent 70%)`,
          filter: "blur(30px)",
          animation: "tsph-glow 4s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 30px 70px -25px rgba(0,0,0,0.55)",
          animation: "tsph-float 6s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.cyan, boxShadow: `0 0 0 4px ${T.accentSoft}` }} />
          <span style={{ ...mono, fontSize: 11.5, color: T.textFaint, letterSpacing: "0.04em" }}>agents at work</span>
        </div>

        <svg viewBox="0 0 380 220" width="100%" height="auto" style={{ overflow: "visible" }}>
          <path d="M190 60 C 140 100, 110 120, 80 150" stroke={T.border} strokeWidth="2" fill="none" />
          <path d="M190 60 C 240 100, 270 120, 300 150" stroke={T.border} strokeWidth="2" fill="none" />
          <path
            d="M190 60 C 140 100, 110 120, 80 150"
            stroke={T.cyan}
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 10"
            style={{ animation: "tsph-flow 1.4s linear infinite" }}
          />
          <path
            d="M190 60 C 240 100, 270 120, 300 150"
            stroke={T.accent}
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 10"
            style={{ animation: "tsph-flow 1.4s linear infinite" }}
          />

          <circle cx="190" cy="50" r="26" fill={T.surface2} stroke={T.borderStrong} />
          <circle
            cx="190"
            cy="50"
            r="26"
            fill="none"
            stroke={T.accent}
            strokeWidth="1.4"
            opacity="0.5"
            style={{ transformOrigin: "190px 50px", animation: "tsph-pulse 2.2s ease-in-out infinite" }}
          />
          <text x="190" y="55" textAnchor="middle" fill={T.textPrimary} fontSize="10" fontFamily="'IBM Plex Mono', monospace">coordinator</text>

          <circle cx="70" cy="165" r="34" fill={T.surface2} stroke={T.borderStrong} />
          <text x="70" y="162" textAnchor="middle" fill={T.textPrimary} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">calculator</text>
          <text x="70" y="176" textAnchor="middle" fill={T.cyan} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">agent</text>

          <circle cx="310" cy="165" r="34" fill={T.surface2} stroke={T.borderStrong} />
          <text x="310" y="162" textAnchor="middle" fill={T.textPrimary} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">action-plan</text>
          <text x="310" y="176" textAnchor="middle" fill={T.accent} fontSize="9.5" fontFamily="'IBM Plex Mono', monospace">agent</text>
        </svg>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ ...mono, fontSize: 10.5, color: T.textFaint, marginBottom: 4 }}>estimated tax</div>
            <div style={{ ...mono, fontSize: 19, color: T.textPrimary, fontWeight: 500 }}>{fmtINR(74100)}</div>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 10.5, color: T.textFaint, marginBottom: 4 }}>potential savings</div>
            <div style={{ ...mono, fontSize: 19, color: T.cyan, fontWeight: 500 }}>{fmtINR(10500)}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: -14,
          right: -14,
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
          animation: "tsph-float 5s ease-in-out infinite 0.5s",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber }} />
        <span style={{ ...sans, fontSize: 11.5, color: T.textSecondary }}>3 agents synced</span>
      </div>
    </div>
  );
}
