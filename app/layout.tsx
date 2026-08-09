import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const description =
  "A strategic incremental game about a flock that plans, adapts, and eventually outgrows the sky.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = (forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000")
    .split(",")[0]
    .trim();
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : host.startsWith("localhost")
        ? "http"
        : "https";
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    title: "Birds vs. Everything",
    description,
    metadataBase: new URL(origin),
    alternates: { canonical: origin },
    icons: { icon: "/favicon.svg" },
    openGraph: {
      type: "website",
      url: origin,
      title: "Birds vs. Everything",
      description,
      siteName: "Birds vs. Everything",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "A living tree grows into a planet and a network of stars.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Birds vs. Everything",
      description,
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
