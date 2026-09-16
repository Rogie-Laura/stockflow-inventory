import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring Center · PinoyStock",
  description:
    "Live sales summary sa web. Full analytics sa PinoyStock Monitor Flutter app.",
};

export default function MonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
