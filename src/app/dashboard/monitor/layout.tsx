import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring Center · PinoyStock",
  description:
    "Live sales at inventory monitoring. I-install sa phone para sa full analytics.",
  appleWebApp: {
    capable: true,
    title: "PinoyMonitor",
    statusBarStyle: "default",
  },
};

export default function MonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
