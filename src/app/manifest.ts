import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PinoyStock Monitoring Center",
    short_name: "PinoyMonitor",
    description:
      "Real-time sales, inventory, at analytics para sa Pinoy negosyo.",
    start_url: "/dashboard/monitor",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["business", "finance"],
    icons: [
      {
        src: "/vercel.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
