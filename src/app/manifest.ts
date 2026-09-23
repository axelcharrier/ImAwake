import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ImAwake",
    short_name: "ImAwake",
    description: "Qui est réveillé dans la coloc ?",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e1b4b",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
