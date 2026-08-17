import type { Metadata } from "next";
import { Anonymous_Pro } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const anonymousPro = Anonymous_Pro({
  variable: "--font-anonymous-pro",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ??
    incomingHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    incomingHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const socialImage = new URL(
    "/og-alchemy-wordmark.png",
    `${protocol}://${host}`,
  ).toString();

  return {
    title: "Alchemy of Wishes — свечи-букеты",
    description: "Свечи ручной работы, собранные как цветочные букеты.",
    openGraph: {
      title: "Alchemy of Wishes",
      description: "Свечи ручной работы, собранные как цветочные букеты.",
      type: "website",
      siteName: "Alchemy of Wishes",
      images: [
        {
          url: socialImage,
          width: 1728,
          height: 909,
          alt: "Alchemy of Wishes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Alchemy of Wishes",
      description: "Свечи ручной работы, собранные как цветочные букеты.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${anonymousPro.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
