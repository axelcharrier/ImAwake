import { ImageResponse } from "next/og";

/** App icon: a rising sun on a night-blue background. `maskable` adds safe-zone padding. */
export function appIcon(size: number, { maskable = false } = {}) {
  const sun = Math.round(size * (maskable ? 0.4 : 0.52));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1b4b",
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <div
          style={{
            width: sun,
            height: sun,
            borderRadius: "50%",
            background: "#fbbf24",
            boxShadow: `0 0 ${Math.round(size * 0.12)}px ${Math.round(size * 0.04)}px rgba(251,191,36,0.6)`,
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
