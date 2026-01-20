import type { Metadata } from "next";
import { Oswald, Abril_Fatface, Bebas_Neue, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const abrilFatface = Abril_Fatface({
  variable: "--font-abril",
  subsets: ["latin"],
  weight: "400",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Mac Daddy's Diner | Classic American Diner on Route 28, Cape Cod",
  description: "A classic American diner with a passion for great food, hot rods, and the spirit of the 1950s. Breakfast, burgers, shakes & more in South Yarmouth, MA.",
  keywords: ["diner", "Cape Cod", "Route 28", "breakfast", "burgers", "American food", "South Yarmouth", "retro diner", "50s diner"],
  openGraph: {
    title: "Mac Daddy's Diner",
    description: "Where Route 28 Meets Good Eats - Classic American Diner on Cape Cod",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${oswald.variable} ${abrilFatface.variable} ${bebasNeue.variable} ${playfairDisplay.variable} antialiased bg-[#FFF8E7] min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
