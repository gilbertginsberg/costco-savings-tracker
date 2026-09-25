import { ImageResponse } from "next/og";

export const alt = "Costco Savings Tracker: this month's Costco Warehouse Savings, searchable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0a4f8c",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#e8a93c", textTransform: "uppercase" }}>
          Costco Savings Tracker
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1, marginTop: 20 }}>
          This month&apos;s Costco deals, searchable.
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 30, color: "rgba(255,255,255,0.75)" }}>
          Filter by category &amp; discount · Archive of every past promo period
        </div>
        <div style={{ display: "flex", fontSize: 24, marginTop: 50, color: "rgba(255,255,255,0.6)" }}>
          by Kirkland Corner
        </div>
      </div>
    ),
    { ...size },
  );
}
