import { ImageResponse } from "next/og";

export const alt = "FitBreak: a better break, in a few minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F7F7F2", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700, color: "#153532" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "#153532", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, border: "5px solid #D9F286", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 9, height: 9, borderRadius: 5, background: "#D9F286" }} />
              </div>
            </div>
            bestfittips.
          </div>
          <div style={{ display: "flex", flexDirection: "column", color: "#153532", fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            <span>Feel better in</span>
            <span style={{ color: "#2C7658" }}>five minutes.</span>
          </div>
          <div style={{ fontSize: 30, color: "#5B6F6B" }}>Guided 2, 5 and 10-minute movement breaks. Free, no signup.</div>
        </div>
        <div style={{ width: 330, borderRadius: 40, background: "#153532", display: "flex", flexDirection: "column", padding: 40, color: "#F3F8F2", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, letterSpacing: 4, color: "#A9C6B8" }}>YOUR NEXT BREAK</div>
          <div style={{ fontSize: 110, fontWeight: 700, letterSpacing: -6 }}>05:00</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ flex: 1, height: 12, borderRadius: 6, background: i < 2 ? "#D9F286" : "rgba(255,255,255,0.18)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
