import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
title: "KataDeals — AI Real Estate Deal Analyzer"
,
description:
"Find and analyze real estate investment deals with AI. Get instant deal scores, cash
flow estimates, and Buy/Hold/Pass recommendations."
,
metadataBase: new URL("https://katadeals.com"),
openGraph: {
title: "KataDeals — AI Real Estate Deal Analyzer"
,
description: "Analyze any property with AI in seconds."
,
url: "https://katadeals.com"
,
},
};
export default async function RootLayout({
children,
}: {
}) {
children: React.ReactNode;
const session = await getServerSession(authOptions);
return (
<html lang="en">
<body className={inter.className}>
<Navbar session={session} />
{children}
</body>
</html>
);
}
