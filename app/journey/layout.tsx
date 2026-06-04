import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Shahi Marg Journey — Route Visualization | Simhastha Kumbh 2027",
  description:
    "Interactive journey visualization of Akhada procession routes along the Shahi Marg during Simhastha Kumbh Mela Trimbakeshwar 2027.",
};

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
